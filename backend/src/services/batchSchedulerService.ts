import { CronJob } from 'cron';
import pool from '../config/database';
import { shippingService } from './shipping/shippingService';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderStatusEmail } from './emailService';
import { mapShippingToOrderStatus } from '../utils/statusMapping';
import { OrderSummary } from '../types/order';

interface BatchJob {
  id: string;
  name: string;
  cronExpression: string;
  isActive: boolean;
  lastRun?: Date;
  job?: CronJob;
}

export class BatchSchedulerService {
  private jobs: Map<string, BatchJob> = new Map();
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load jobs from database
      const [jobs]: any = await pool.query(
        'SELECT * FROM batch_jobs WHERE is_active = true'
      );

      // Initialize each job
      for (const job of jobs) {
        this.addJob({
          id: job.id,
          name: job.name,
          cronExpression: job.cron_expression,
          isActive: true,
          lastRun: job.last_run
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing batch scheduler:', error);
    }
  }

  addJob(jobConfig: BatchJob) {
    try {
      const job = new CronJob(
        jobConfig.cronExpression,
        async () => {
          console.log(`Starting batch job: ${jobConfig.name}`);
          await this.executeJob(jobConfig.name);
          console.log(`Completed batch job: ${jobConfig.name}`);
        },
        null,
        true,
        'UTC'
      );

      this.jobs.set(jobConfig.id, {
        ...jobConfig,
        job
      });

      if (jobConfig.isActive) {
        job.start();
      }
    } catch (error) {
      console.error(`Error adding job ${jobConfig.name}:`, error);
    }
  }

  async executeJob(jobName: string) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      switch (jobName) {
        case 'update_active_shipments':
          await this.updateActiveShipments(connection);
          break;
        case 'check_delayed_shipments':
          await this.checkDelayedShipments(connection);
          break;
        case 'cleanup_old_events':
          await this.cleanupOldEvents(connection);
          break;
        case 'generate_daily_report':
          await this.generateDailyReport(connection);
          break;
        case 'optimize_delivery_routes':
          await this.optimizeDeliveryRoutes(connection);
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }

      // Update last run time
      await connection.query(
        'UPDATE batch_jobs SET last_run = NOW() WHERE name = ?',
        [jobName]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error(`Error executing job ${jobName}:`, error);
    } finally {
      connection.release();
    }
  }

  private async updateActiveShipments(connection: any) {
    const [shipments]: any = await connection.query(
      `SELECT 
        s.*,
        o.status as order_status,
        o.user_id,
        u.email,
        u.first_name,
        u.last_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE s.status NOT IN ('delivered', 'cancelled', 'returned')
        AND o.status NOT IN ('delivered', 'cancelled')
      GROUP BY s.id
      LIMIT 100`
    );

    for (const shipment of shipments) {
      try {
        const tracking = await shippingService.getTracking(
          shipment.provider_id,
          shipment.tracking_number
        );

        if (tracking.status !== shipment.status) {
          // Update shipment status
          await connection.query(
            `UPDATE shipments 
             SET status = ?, 
                 actual_delivery_date = ?
             WHERE id = ?`,
            [
              tracking.status,
              tracking.isDelivered ? tracking.deliveryDate : null,
              shipment.id
            ]
          );

          // Add tracking events
          for (const event of tracking.events) {
            await connection.query(
              `INSERT IGNORE INTO shipment_tracking_events 
               (id, shipment_id, status, timestamp, location, description)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                uuidv4(),
                shipment.id,
                event.status,
                event.date,
                event.location,
                event.description
              ]
            );
          }

          // Update order status if needed
          const orderStatus = mapShippingToOrderStatus(tracking.status);
          if (orderStatus && orderStatus !== shipment.order_status) {
            await connection.query(
              'UPDATE orders SET status = ? WHERE id = ?',
              [orderStatus, shipment.order_id]
            );

            // Add order status history
            await connection.query(
              `INSERT INTO order_status_history (id, order_id, status, notes)
               VALUES (?, ?, ?, ?)`,
              [
                uuidv4(),
                shipment.order_id,
                orderStatus,
                `Automatically updated based on shipping status: ${tracking.status}`
              ]
            );

            // Send email notification
            await sendOrderStatusEmail(shipment.email, {
              id: shipment.order_id,
              status: orderStatus,
              customerName: `${shipment.first_name} ${shipment.last_name}`,
              items: JSON.parse(shipment.items),
              totalAmount: shipment.total_amount,
              trackingNumber: shipment.tracking_number
            });
          }
        }
      } catch (error) {
        console.error(
          `Error updating tracking for shipment ${shipment.id}:`,
          error
        );
      }
    }
  }

  private async checkDelayedShipments(connection: any) {
    const [shipments]: any = await connection.query(
      `SELECT 
        s.*,
        o.id as order_id,
        o.status as order_status,
        u.email,
        u.first_name,
        u.last_name
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE s.status NOT IN ('delivered', 'cancelled', 'returned')
        AND s.estimated_delivery_date < NOW()
        AND NOT EXISTS (
          SELECT 1 
          FROM shipment_issues si 
          WHERE si.shipment_id = s.id 
            AND si.type = 'delay'
            AND si.resolved_at IS NULL
        )`
    );

    for (const shipment of shipments) {
      // Create shipment issue
      await connection.query(
        `INSERT INTO shipment_issues 
         (id, shipment_id, type, description, created_at)
         VALUES (?, ?, 'delay', ?, NOW())`,
        [
          uuidv4(),
          shipment.id,
          'Delivery is delayed beyond estimated delivery date'
        ]
      );

      // Send notification email
      await sendOrderStatusEmail(shipment.email, {
        id: shipment.order_id,
        status: 'delayed',
        customerName: `${shipment.first_name} ${shipment.last_name}`,
        trackingNumber: shipment.tracking_number
      });
    }
  }

  private async cleanupOldEvents(connection: any) {
    // Zadržavamo događaje ne starije od 6 mjeseci
    await connection.query(
      `DELETE FROM shipment_tracking_events 
       WHERE timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH)
         AND shipment_id IN (
           SELECT id 
           FROM shipments 
           WHERE status IN ('delivered', 'cancelled', 'returned')
         )`
    );

    // Arhiviramo riješene probleme starije od 3 mjeseca
    await connection.query(
      `INSERT INTO shipment_issues_archive 
       SELECT * FROM shipment_issues 
       WHERE resolved_at IS NOT NULL 
         AND resolved_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)`
    );

    await connection.query(
      `DELETE FROM shipment_issues 
       WHERE resolved_at IS NOT NULL 
         AND resolved_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)`
    );
  }

  private async generateDailyReport(connection: any) {
    const [metrics]: any = await connection.query(
      `SELECT 
        COUNT(*) as total_shipments,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE 
          WHEN status != 'delivered' 
            AND estimated_delivery_date < NOW() 
          THEN 1 
          ELSE 0 
        END) as delayed,
        AVG(CASE 
          WHEN status = 'delivered' 
          THEN TIMESTAMPDIFF(HOUR, created_at, actual_delivery_date)
          ELSE NULL 
        END) as avg_delivery_time
      FROM shipments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    // Spremi izvještaj u bazu
    await connection.query(
      `INSERT INTO daily_reports 
       (id, date, metrics, created_at)
       VALUES (UUID(), CURDATE(), ?, NOW())`,
      [JSON.stringify(metrics)]
    );

    // Pošalji email s izvještajem
    // TODO: Implementirati slanje email izvještaja
  }

  private async optimizeDeliveryRoutes(connection: any) {
    // Dohvati aktivne pošiljke za dostavu
    const [shipments]: any = await connection.query(
      `SELECT 
        s.*,
        a.latitude,
        a.longitude
      FROM shipments s
      JOIN orders o ON s.order_id = o.id
      JOIN addresses a ON o.delivery_address_id = a.id
      WHERE s.status = 'out_for_delivery'
      ORDER BY a.postal_code, a.city`
    );

    // Grupiraj pošiljke po poštanskom broju i gradu
    const grouped = shipments.reduce((acc: any, s: any) => {
      const key = `${s.postal_code}-${s.city}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(s);
      return acc;
    }, {});

    // Optimiziraj rute za svaku grupu
    for (const [key, groupShipments] of Object.entries(grouped)) {
      // Implementirati algoritam za optimizaciju rute
      // TODO: Implementirati stvarnu optimizaciju rute
      
      // Ažuriraj redoslijed dostave
      for (const [index, shipment] of (groupShipments as any[]).entries()) {
        await connection.query(
          `UPDATE shipments 
           SET delivery_order = ? 
           WHERE id = ?`,
          [index + 1, shipment.id]
        );
      }
    }
  }

  private async processOrder(order: any): Promise<OrderSummary> {
    return {
      id: order.id,
      status: order.status,
      customerName: `${order.first_name} ${order.last_name}`,
      items: order.items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.total_amount,
      trackingNumber: order.tracking_number
    };
  }

  stopAll() {
    for (const [, job] of this.jobs) {
      job.job?.stop();
    }
    this.jobs.clear();
    this.isInitialized = false;
  }
}

export const batchSchedulerService = new BatchSchedulerService(); 