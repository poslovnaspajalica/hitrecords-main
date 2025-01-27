import { shippingService } from './shipping/shippingService';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderStatusEmail } from './emailService';
import { mapShippingToOrderStatus } from '../utils/statusMapping';

export class TrackingUpdateService {
  private isRunning: boolean = false;
  private interval: number = 15 * 60 * 1000; // 15 minuta

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const updateTracking = async () => {
      if (!this.isRunning) return;

      try {
        await this.updateAllActiveShipments();
      } catch (error) {
        console.error('Error updating shipment tracking:', error);
      }

      // Schedule next update
      setTimeout(updateTracking, this.interval);
    };

    // Start first update
    updateTracking();
  }

  stop() {
    this.isRunning = false;
  }

  private async updateAllActiveShipments() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get all active shipments
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
        GROUP BY s.id`
      );

      for (const shipment of shipments) {
        try {
          // Get latest tracking info
          const tracking = await shippingService.getTracking(
            shipment.provider_id,
            shipment.tracking_number
          );

          // If status changed
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

            // Add tracking event
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

            // Check for delayed delivery
            if (this.isDeliveryDelayed(shipment, tracking)) {
              await this.handleDelayedDelivery(connection, shipment);
            }
          }
        } catch (error) {
          console.error(
            `Error updating tracking for shipment ${shipment.id}:`,
            error
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private isDeliveryDelayed(shipment: any, tracking: any): boolean {
    if (!shipment.estimated_delivery_date) return false;

    const estimatedDate = new Date(shipment.estimated_delivery_date);
    const now = new Date();

    return now > estimatedDate && !tracking.isDelivered;
  }

  private async handleDelayedDelivery(connection: any, shipment: any) {
    // Add note to order history
    await connection.query(
      `INSERT INTO order_status_history (id, order_id, status, notes)
       VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        shipment.order_id,
        shipment.order_status,
        'Delivery is delayed beyond estimated delivery date'
      ]
    );

    // Send notification email
    await sendOrderStatusEmail(shipment.email, {
      id: shipment.order_id,
      status: 'delayed',
      customerName: `${shipment.first_name} ${shipment.last_name}`,
      items: JSON.parse(shipment.items),
      totalAmount: shipment.total_amount,
      trackingNumber: shipment.tracking_number
    });
  }
}

export const trackingUpdateService = new TrackingUpdateService(); 