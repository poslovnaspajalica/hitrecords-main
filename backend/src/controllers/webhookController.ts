import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderStatusEmail, sendPaymentConfirmation, sendPaymentFailedNotification } from '../services/emailService';
import { verifyWebhookSignature } from '../utils/webhookVerification';
import { shippingService } from '../services/shipping/shippingService';
import { mapShippingToOrderStatus } from '../utils/statusMapping';
import { paymentService } from '../services/payment/paymentService';
import { validateWebhookSignature } from '../utils/webhookValidation';
import { WebhookValidationData } from '../types/payment';
import { EmailService } from '../services/emailService';

// Webhook handler for shipping status updates
export const handleShippingWebhook = async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider;
  const signature = req.headers['x-webhook-signature'];

  // Verify webhook signature
  if (!signature || !verifyWebhookSignature(provider, req.body, signature as string)) {
    console.error('Invalid webhook signature for provider:', provider);
    res.status(401).json({ message: 'Invalid webhook signature' });
    return;
  }

  // Start transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Parse webhook data based on provider
    const { 
      trackingNumber, 
      status, 
      timestamp, 
      location, 
      description 
    } = parseWebhookData(provider, req.body);

    // Update shipment status
    const [shipments]: any = await connection.query(
      `SELECT 
        s.*,
        o.user_id,
        o.status as order_status,
        o.total_amount,
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
      WHERE s.tracking_number = ?
      GROUP BY s.id`,
      [trackingNumber]
    );

    if (!shipments.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const shipment = shipments[0];

    // Update shipment status
    await connection.query(
      `UPDATE shipments 
       SET status = ?, 
           actual_delivery_date = ?
       WHERE tracking_number = ?`,
      [
        status,
        status === 'delivered' ? new Date(timestamp) : null,
        trackingNumber
      ]
    );

    // Add tracking event
    await connection.query(
      `INSERT INTO shipment_tracking_events 
       (id, shipment_id, status, timestamp, location, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        shipment.id,
        status,
        new Date(timestamp),
        location,
        description
      ]
    );

    // Update order status if needed
    const orderStatus = mapShippingToOrderStatus(status);
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
          `Automatically updated based on shipping status: ${status}`
        ]
      );

      // Send email notification
      await sendOrderStatusEmail(shipment.email, {
        id: shipment.order_id,
        status: orderStatus,
        customerName: `${shipment.first_name} ${shipment.last_name}`,
        items: JSON.parse(shipment.items),
        totalAmount: shipment.total_amount,
        trackingNumber
      });
    }

    await connection.commit();
    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Error processing webhook' });
  } finally {
    connection.release();
  }
};

// Manual tracking update webhook
export const handleManualTrackingUpdate = async (req: Request, res: Response) => {
  const { shipmentIds } = req.body;
  const apiKey = req.headers['x-api-key'];

  // Verify API key
  if (apiKey !== process.env.MANUAL_TRACKING_API_KEY) {
    return res.status(401).json({ message: 'Invalid API key' });
  }

  if (!Array.isArray(shipmentIds) || !shipmentIds.length) {
    return res.status(400).json({ message: 'Shipment IDs array required' });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Get shipments to update
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
      WHERE s.id IN (?)
        AND s.status NOT IN ('delivered', 'cancelled', 'returned')
      GROUP BY s.id`,
      [shipmentIds]
    );

    const results = {
      updated: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[]
    };

    // Update each shipment
    for (const shipment of shipments) {
      try {
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

          results.updated++;
          results.details.push({
            shipmentId: shipment.id,
            status: 'updated',
            oldStatus: shipment.status,
            newStatus: tracking.status
          });
        } else {
          results.skipped++;
          results.details.push({
            shipmentId: shipment.id,
            status: 'skipped',
            reason: 'No status change'
          });
        }
      } catch (error) {
        console.error(`Error updating shipment ${shipment.id}:`, error);
        results.failed++;
        results.details.push({
          shipmentId: shipment.id,
          status: 'failed',
          error: (error as Error).message
        });
      }
    }

    await connection.commit();
    res.json(results);
  } catch (error) {
    await connection.rollback();
    console.error('Manual tracking update error:', error);
    res.status(500).json({ message: 'Error updating tracking' });
  } finally {
    connection.release();
  }
};

// Handle payment webhook
export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider;

  try {
    const result = await paymentService.handleWebhook(provider, req.body);

    if (result.success) {
      // Send confirmation email
      await sendPaymentConfirmation(result.orderId);
      res.json({ status: 'success' });
    } else {
      // Send failed payment notification
      await sendPaymentFailedNotification(result.orderId, result.error || 'Unknown error');
      res.status(400).json({ status: 'error', message: result.error });
    }
  } catch (error: any) {
    console.error('Error handling payment webhook:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Helper functions
function parseWebhookData(provider: string, payload: any): {
  trackingNumber: string;
  status: string;
  timestamp: string;
  location: string;
  description: string;
} {
  switch (provider) {
    case 'hp_express':
      return {
        trackingNumber: payload.trackingNumber,
        status: payload.status,
        timestamp: payload.timestamp,
        location: payload.location,
        description: payload.description
      };
    case 'dhl':
      return {
        trackingNumber: payload.shipmentId,
        status: payload.status.statusCode,
        timestamp: payload.status.timestamp,
        location: payload.status.location?.address?.addressLocality || '',
        description: payload.status.description
      };
    case 'overseas':
      return {
        trackingNumber: payload.tracking_number,
        status: payload.status,
        timestamp: payload.last_update,
        location: payload.current_location,
        description: payload.status_description
      };
    case 'boxnow':
      return {
        trackingNumber: payload.trackingCode,
        status: payload.status,
        timestamp: payload.lastUpdate,
        location: payload.currentBox?.name || '',
        description: payload.statusDescription
      };
    default:
      throw new Error('Unknown provider');
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider;
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    const validationData: WebhookValidationData = {
      payload: req.body,
      signature,
      timestamp,
      secretKey: process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || ''
    };

    const isValid = await validateWebhookSignature(validationData);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook
    // ... ostatak koda ...

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 