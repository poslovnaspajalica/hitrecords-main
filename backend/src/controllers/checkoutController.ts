import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { paymentService } from '../services/payment/paymentService';
import { CheckoutData } from '../types/checkout';

export const processCheckout = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const userId = req.user?.userId; // Using userId instead of id
    const checkoutData: CheckoutData = req.body;

    // Validate payment method
    const [methods]: any = await connection.query(
      'SELECT * FROM payment_methods WHERE id = ? AND is_active = true',
      [checkoutData.payment.methodId]
    );

    if (!methods.length) {
      throw new Error('Invalid payment method');
    }

    // Validate shipping method
    const [shippingMethods]: any = await connection.query(
      'SELECT * FROM shipping_rates WHERE id = ? AND is_active = true',
      [checkoutData.shippingMethod.id]
    );

    if (!shippingMethods.length) {
      throw new Error('Invalid shipping method');
    }

    // Validate products and prices
    const productIds = checkoutData.items.map(item => item.productId);
    const [products]: any = await connection.query(
      'SELECT id, price, name, stock_quantity FROM products WHERE id IN (?)',
      [productIds]
    );

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let calculatedTotal = 0;
    for (const item of checkoutData.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if ((product as any).stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${(product as any).name}`);
      }
      if ((product as any).price !== item.price) {
        throw new Error(`Price mismatch for ${(product as any).name}`);
      }
      calculatedTotal += item.price * item.quantity;
    }

    // Add shipping cost
    calculatedTotal += checkoutData.shippingMethod.price;

    // Validate total amount
    if (Math.abs(calculatedTotal - checkoutData.totalAmount) > 0.01) {
      throw new Error('Total amount mismatch');
    }

    // 2. Create order
    const orderId = uuidv4();
    await connection.query(
      `INSERT INTO orders (
        id, user_id, status, payment_status, total_amount,
        shipping_address, shipping_method_id, created_at
      ) VALUES (?, ?, 'pending', 'pending', ?, ?, ?, NOW())`,
      [
        orderId,
        userId,
        checkoutData.totalAmount,
        JSON.stringify(checkoutData.shippingAddress),
        checkoutData.shippingMethod.id
      ]
    );

    // 3. Create order items
    const orderItems = checkoutData.items.map(item => [
      uuidv4(),
      orderId,
      item.productId,
      item.quantity,
      item.price
    ]);

    await connection.query(
      `INSERT INTO order_items (id, order_id, product_id, quantity, price)
       VALUES ?`,
      [orderItems]
    );

    // 4. Initialize payment
    const paymentResult = await paymentService.initializePayment(
      orderId,
      checkoutData.payment.methodId,
      checkoutData.totalAmount
    );

    // 5. Update inventory
    for (const item of checkoutData.items) {
      await connection.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - ?,
             updated_at = NOW()
         WHERE id = ? AND stock_quantity >= ?`,
        [item.quantity, item.productId, item.quantity]
      );
    }

    // 6. Create order status history
    await connection.query(
      `INSERT INTO order_status_history (id, order_id, status, notes)
       VALUES (?, ?, 'pending', 'Order created')`,
      [uuidv4(), orderId]
    );

    await connection.commit();

    // Return response based on payment method
    if (paymentResult.redirectUrl) {
      // For payment methods that require redirect (PayPal, PayWay)
      res.json({
        orderId,
        paymentId: paymentResult.paymentId,
        redirectUrl: paymentResult.redirectUrl,
        status: 'redirect'
      });
    } else if (paymentResult.status === 'pending') {
      // For payment methods that require manual confirmation (bank transfer)
      res.json({
        orderId,
        paymentId: paymentResult.paymentId,
        instructions: paymentResult.providerData,
        status: 'pending'
      });
    } else {
      // For immediate payment methods (COD)
      res.json({
        orderId,
        paymentId: paymentResult.paymentId,
        status: 'success'
      });
    }
  } catch (error: any) {
    await connection.rollback();
    console.error('Checkout error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Error processing checkout'
    });
  } finally {
    connection.release();
  }
};

// Handle payment return from external providers
export const handlePaymentReturn = async (req: Request, res: Response) => {
  const { orderId, paymentId } = req.query;

  try {
    const result = await paymentService.processPayment(paymentId as string, {
      orderId,
      ...req.body
    });

    if (result.success) {
      res.redirect(`${process.env.FRONTEND_URL}/checkout/success?orderId=${orderId}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/checkout/error?orderId=${orderId}&error=${result.error}`);
    }
  } catch (error: any) {
    console.error('Payment return error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/checkout/error?orderId=${orderId}&error=payment_failed`);
  }
}; 