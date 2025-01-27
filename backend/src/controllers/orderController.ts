import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoicePDF } from '../utils/pdf';
import { sendOrderStatusEmail } from '../services/emailService';
import { shippingService } from '../services/shipping/shippingService';

// Create order from cart
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      shippingAddressId, 
      billingAddressId, 
      paymentMethod, 
      shippingMethod,
      notes 
    } = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get cart items
      const [cart]: any = await pool.query(
        'SELECT id FROM carts WHERE user_id = ?',
        [userId]
      );

      if (!cart.length) {
        await connection.rollback();
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const cartId = cart[0].id;

      // Get cart items with product details
      const [items]: any = await connection.query(
        `SELECT 
          ci.*,
          p.price,
          p.weight,
          p.stock_quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = ?`,
        [cartId]
      );

      if (!items.length) {
        await connection.rollback();
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Verify stock and calculate total weight
      let totalAmount = 0;
      let totalWeight = 0;
      for (const item of items) {
        if (item.quantity > item.stock_quantity) {
          await connection.rollback();
          return res.status(400).json({ 
            message: `Not enough stock for product ID: ${item.product_id}` 
          });
        }
        totalAmount += item.price * item.quantity;
        totalWeight += (item.weight || 0) * item.quantity;
      }

      // Get shipping address for rate calculation
      const [addresses]: any = await connection.query(
        'SELECT * FROM user_addresses WHERE id = ?',
        [shippingAddressId]
      );

      if (!addresses.length) {
        await connection.rollback();
        return res.status(400).json({ message: 'Invalid shipping address' });
      }

      const shippingAddress = addresses[0];

      // Verify shipping rate is valid
      const availableRates = await shippingService.calculateRates(
        totalWeight,
        {
          postalCode: shippingAddress.postal_code,
          countryCode: shippingAddress.country_code
        },
        !!shippingMethod.pickupPointId
      );

      const selectedRate = availableRates.find(
        rate => rate.provider === shippingMethod.provider && 
                rate.id === shippingMethod.rateId
      );

      if (!selectedRate) {
        await connection.rollback();
        return res.status(400).json({ message: 'Invalid shipping rate' });
      }

      // Create order
      const orderId = uuidv4();
      await connection.query(
        `INSERT INTO orders (
          id, user_id, total_amount, shipping_fee,
          shipping_address_id, billing_address_id,
          payment_method, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          userId,
          totalAmount,
          selectedRate.price,
          shippingAddressId,
          billingAddressId,
          paymentMethod,
          notes
        ]
      );

      // Create order items and update stock
      for (const item of items) {
        const orderItemId = uuidv4();
        await connection.query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderItemId, orderId, item.product_id, item.quantity, item.price]
        );

        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Create shipment
      const shipment = await shippingService.createShipment(
        shippingMethod.provider,
        {
          orderId,
          recipientName: `${(req as any).user.firstName} ${(req as any).user.lastName}`,
          recipientPhone: shippingAddress.phone || '',
          recipientEmail: (req as any).user.email,
          address: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            postalCode: shippingAddress.postal_code,
            countryCode: shippingAddress.country_code
          },
          packages: [{
            weight: totalWeight
          }],
          isPickupPoint: !!shippingMethod.pickupPointId,
          pickupPointId: shippingMethod.pickupPointId,
          shippingRateId: shippingMethod.rateId
        }
      );

      // Clear cart
      await connection.query(
        'DELETE FROM cart_items WHERE cart_id = ?',
        [cartId]
      );

      await connection.commit();

      // Return order details
      res.status(201).json({
        orderId,
        trackingNumber: shipment.trackingNumber,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Get user orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [orders]: any = await pool.query(
      `SELECT 
        o.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'productId', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [total]: any = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [userId]
    );

    res.json({
      orders: orders.map((order: any) => ({
        ...order,
        items: JSON.parse(order.items)
      })),
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get single order
export const getOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const [orders]: any = await pool.query(
      `SELECT 
        o.*,
        s.provider_id,
        s.tracking_number,
        s.label_url,
        s.status as shipping_status,
        s.estimated_delivery_date,
        s.actual_delivery_date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'productId', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'status', osh.status,
            'notes', osh.notes,
            'createdAt', osh.created_at
          )
        ) as status_history,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'status', ste.status,
              'timestamp', ste.timestamp,
              'location', ste.location,
              'description', ste.description
            )
          )
          FROM shipment_tracking_events ste
          WHERE ste.shipment_id = s.id
          ORDER BY ste.timestamp DESC
        ) as shipping_history
      FROM orders o
      LEFT JOIN shipments s ON o.id = s.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN order_status_history osh ON o.id = osh.order_id
      WHERE o.id = ? AND o.user_id = ?
      GROUP BY o.id`,
      [id, userId]
    );

    if (!orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];
    res.json({
      ...order,
      items: JSON.parse(order.items),
      statusHistory: JSON.parse(order.status_history),
      shippingHistory: order.shipping_history ? JSON.parse(order.shipping_history) : []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let query = `
      SELECT 
        o.*,
        u.email as user_email,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.id,
            'productId', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    if (status) {
      query += ` AND o.status = ?`;
      queryParams.push(status);
    }

    if (search) {
      query += ` AND (o.id LIKE ? OR u.email LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [orders]: any = await pool.query(query, queryParams);

    const [total]: any = await pool.query(
      'SELECT COUNT(*) as count FROM orders',
      []
    );

    res.json({
      orders: orders.map((order: any) => ({
        ...order,
        items: JSON.parse(order.items)
      })),
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber } = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get order details before update
      const [orders]: any = await connection.query(
        `SELECT 
          o.*,
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
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ?
        GROUP BY o.id`,
        [id]
      );

      if (orders.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Order not found' });
      }

      const order = orders[0];

      // Update order status
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );

      // Add status history
      await connection.query(
        `INSERT INTO order_status_history (id, order_id, status, notes)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), id, status, notes]
      );

      // If order is cancelled, restore stock
      if (status === 'cancelled') {
        const [items]: any = await connection.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [id]
        );

        for (const item of items) {
          await connection.query(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      await connection.commit();

      // Send email notification
      await sendOrderStatusEmail(order.email, {
        id: order.id,
        status,
        customerName: `${order.first_name} ${order.last_name}`,
        items: JSON.parse(order.items),
        totalAmount: order.total_amount,
        trackingNumber
      });

      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// Admin: Get order statistics
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const [totalStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders
      WHERE status != 'cancelled'
    `);

    const [statusStats]: any = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    const [dailyStats]: any = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      total: totalStats[0],
      byStatus: statusStats,
      daily: dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order statistics' });
  }
};

// Cancel order (for both admin and customer)
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if order can be cancelled
      const [orders]: any = await connection.query(
        `SELECT status, user_id 
         FROM orders 
         WHERE id = ? ${!isAdmin ? 'AND user_id = ?' : ''}`,
        isAdmin ? [id] : [id, userId]
      );

      if (!orders.length) {
        await connection.rollback();
        return res.status(404).json({ message: 'Order not found' });
      }

      const order = orders[0];

      if (!['pending', 'processing'].includes(order.status)) {
        await connection.rollback();
        return res.status(400).json({ 
          message: 'Order cannot be cancelled in current status' 
        });
      }

      // Update order status
      await connection.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', id]
      );

      // Add status history
      await connection.query(
        `INSERT INTO order_status_history (id, order_id, status, notes)
         VALUES (?, ?, 'cancelled', ?)`,
        [uuidv4(), id, 'Cancelled by ' + (isAdmin ? 'admin' : 'customer')]
      );

      // Restore stock
      const [items]: any = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();

      // TODO: Send email notification about cancellation

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

// Get order invoice
export const getOrderInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    // Get order with all needed data
    const [orders]: any = await pool.query(
      `SELECT 
        o.*,
        u.email as customer_email,
        u.first_name,
        u.last_name,
        sa.street as shipping_street,
        sa.city as shipping_city,
        sa.postal_code as shipping_postal_code,
        sa.country_code as shipping_country,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN user_addresses sa ON o.shipping_address_id = sa.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? ${!isAdmin ? 'AND o.user_id = ?' : ''}
      GROUP BY o.id`,
      isAdmin ? [id] : [id, userId]
    );

    if (!orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];
    const items = JSON.parse(order.items);

    const orderData = {
      id: order.id,
      createdAt: order.created_at,
      customerName: `${order.first_name} ${order.last_name}`,
      customerEmail: order.customer_email,
      shippingAddress: {
        street: order.shipping_street,
        city: order.shipping_city,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country
      },
      items,
      totalAmount: order.total_amount,
      shippingFee: order.shipping_fee
    };

    const doc = generateInvoicePDF(orderData);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.id}.pdf`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error generating invoice' });
  }
}; 