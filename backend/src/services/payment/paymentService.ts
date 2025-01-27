import pool from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { PayPalService } from './providers/paypalService';
import { PayWayService } from './providers/paywayService';
import { BankTransferService } from './providers/bankTransferService';
import { CodService } from './providers/codService';
import { PaymentProvider } from './types';
import { webhookHandlers } from './webhookHandlers';
import { PaymentResult } from '../../types/payment';

export interface PaymentInitResult {
  paymentId: string;
  redirectUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  providerData?: any;
}

export class PaymentService {
  private providers: Map<string, PaymentProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set('paypal', new PayPalService());
    this.providers.set('payway', new PayWayService());
    this.providers.set('bank_transfer', new BankTransferService());
    this.providers.set('cod', new CodService());
  }

  async initializePayment(orderId: string, methodId: string, amount: number) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get payment method
      const [methods]: any = await connection.query(
        'SELECT * FROM payment_methods WHERE id = ? AND is_active = true',
        [methodId]
      );

      if (!methods.length) {
        throw new Error('Invalid payment method');
      }

      const method = methods[0];
      const provider = this.providers.get(method.code);

      if (!provider) {
        throw new Error('Payment provider not configured');
      }

      // Initialize payment with provider
      const paymentData = await provider.initializePayment({
        orderId,
        amount,
        currency: 'EUR',
        config: JSON.parse(method.config)
      });

      // Create payment record
      const paymentId = uuidv4();
      await connection.query(
        `INSERT INTO payments 
         (id, order_id, payment_method_id, amount, status, payment_data)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          orderId,
          methodId,
          amount,
          'pending',
          JSON.stringify(paymentData)
        ]
      );

      // Update order
      await connection.query(
        `UPDATE orders 
         SET payment_method_id = ?, 
             payment_status = 'pending',
             payment_due_date = DATE_ADD(NOW(), INTERVAL 48 HOUR)
         WHERE id = ?`,
        [methodId, orderId]
      );

      await connection.commit();

      return {
        paymentId,
        ...paymentData
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async processPayment(paymentId: string, paymentData: any): Promise<PaymentResult> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get payment details
      const [payments]: any = await connection.query(
        `SELECT p.*, pm.code, pm.config
         FROM payments p
         JOIN payment_methods pm ON p.payment_method_id = pm.id
         WHERE p.id = ?`,
        [paymentId]
      );

      if (!payments.length) {
        throw new Error('Payment not found');
      }

      const payment = payments[0];
      const provider = this.providers.get(payment.code);

      if (!provider) {
        throw new Error('Payment provider not configured');
      }

      // Process payment with provider
      const result = await provider.processPayment({
        ...paymentData,
        config: JSON.parse(payment.config)
      });

      // Update payment status
      await connection.query(
        `UPDATE payments 
         SET status = ?,
             transaction_id = ?,
             payment_data = JSON_MERGE_PATCH(payment_data, ?),
             error_message = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          result.status,
          result.transactionId,
          JSON.stringify(result.providerData || {}),
          result.errorMessage,
          paymentId
        ]
      );

      // Update order status if payment completed
      if (result.status === 'completed') {
        await connection.query(
          `UPDATE orders o
           JOIN payments p ON p.order_id = o.id
           SET o.payment_status = 'completed'
           WHERE p.id = ?`,
          [paymentId]
        );
      }

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getPaymentMethods(): Promise<any[]> {
    const [methods]: any = await pool.query(
      'SELECT id, code, name, description, requires_confirmation FROM payment_methods WHERE is_active = true'
    );
    return methods;
  }

  async getPaymentDetails(paymentId: string): Promise<any> {
    const [payments]: any = await pool.query(
      `SELECT 
         p.*,
         pm.code,
         pm.name as method_name,
         o.id as order_id,
         o.total_amount,
         u.email,
         u.first_name,
         u.last_name
       FROM payments p
       JOIN payment_methods pm ON p.payment_method_id = pm.id
       JOIN orders o ON p.order_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE p.id = ?`,
      [paymentId]
    );

    if (!payments.length) {
      throw new Error('Payment not found');
    }

    const payment = payments[0];
    return {
      ...payment,
      payment_data: JSON.parse(payment.payment_data)
    };
  }

  async handleWebhook(provider: string, payload: any): Promise<PaymentResult> {
    const handler = webhookHandlers.get(provider);
    if (!handler) {
      throw new Error('Unknown payment provider');
    }

    // Validate webhook
    const isValid = handler.validateWebhook({
      payload,
      signature: payload.signature,
      timestamp: payload.timestamp,
      secretKey: process.env[`${provider.toUpperCase()}_WEBHOOK_KEY`]!
    });

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Parse webhook data
    const webhookData = handler.parseWebhookData(payload);

    // Update payment status
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        `UPDATE payments 
         SET status = ?,
             transaction_id = ?,
             payment_data = JSON_MERGE_PATCH(payment_data, ?),
             error_message = ?,
             updated_at = NOW()
         WHERE order_id = ?`,
        [
          webhookData.status,
          webhookData.transactionId,
          JSON.stringify(webhookData.metadata || {}),
          webhookData.errorMessage,
          webhookData.orderId
        ]
      );

      // Update order status
      await connection.query(
        `UPDATE orders 
         SET payment_status = ?
         WHERE id = ?`,
        [webhookData.status, webhookData.orderId]
      );

      await connection.commit();

      return {
        success: webhookData.status === 'completed',
        status: webhookData.status,
        transactionId: webhookData.transactionId,
        errorMessage: webhookData.errorMessage,
        orderId: webhookData.orderId
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const paymentService = new PaymentService(); 