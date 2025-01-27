import { Request, Response } from 'express';
import pool from '../../config/database';
import { paymentService } from '../../services/payment/paymentService';

// Get all payments with filtering and pagination
export const getPayments = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        o.id as order_id,
        o.total_amount as order_total,
        u.email as customer_email,
        u.first_name,
        u.last_name,
        pm.name as payment_method_name,
        pm.code as payment_method_code
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Apply filters
    if (req.query.status) {
      query += ` AND p.status = ?`;// Dodavanje administratora
export const addAdmin = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { email, password, firstName, lastName } = req.body;

    const hashedPassword = await hashPassword(password);

    await connection.query(
      `INSERT INTO users (email, password, first_name, last_name, role)
       VALUES (?, ?, ?, ?, 'admin')`,
      [email, hashedPassword, firstName, lastName]
    );

    res.json({ message: 'Administrator dodan uspješno' });
  } catch (error) {
    console.error('Greška pri dodavanju administratora:', error);
    res.status(500).json({ message: 'Greška pri dodavanju administratora' });
  } finally {
    connection.release();
  }
};

// Brisanje administratora
export const deleteAdmin = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.query(
      `DELETE FROM users
       WHERE id = ? AND role = 'admin'`,
      [id]
    );

    res.json({ message: 'Administrator obrisan uspješno' });
  } catch (error) {
    console.error('Greška pri brisanju administratora:', error);
    res.status(500).json({ message: 'Greška pri brisanju administratora' });
  } finally {
    connection.release();
  }
};

// Ažuriranje administratora
export const updateAdmin = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName } = req.body;

    if (password) {
      const hashedPassword = await hashPassword(password);
      await connection.query(
        `UPDATE users
         SET email = ?, password = ?, first_name = ?, last_name = ?
         WHERE id = ? AND role = 'admin'`,
        [email, hashedPassword, firstName, lastName, id]
      );
    } else {
      await connection.query(
        `UPDATE users
         SET email = ?, first_name = ?, last_name = ?
         WHERE id = ? AND role = 'admin'`,
        [email, firstName, lastName, id]
      );
    }

    res.json({ message: 'Administrator ažuriran uspješno' });

      queryParams.push(req.query.status);
    }

    if (req.query.method) {
      query += ` AND pm.code = ?`;
      queryParams.push(req.query.method);
    }

    if (req.query.search) {
      query += ` AND (
        p.id LIKE ? OR 
        o.id LIKE ? OR 
        u.email LIKE ? OR
        CONCAT(u.first_name, ' ', u.last_name) LIKE ?
      )`;
      const searchTerm = `%${req.query.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult]: any = await connection.query(
      query.replace(/SELECT.*?FROM/s, 'SELECT COUNT(*) as count FROM'),
      queryParams
    );

    // Apply pagination
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [payments]: any = await connection.query(query, queryParams);

    res.json({
      payments: payments.map((p: any) => ({
        ...p,
        payment_data: JSON.parse(p.payment_data || '{}')
      })),
      pagination: {
        page,
        limit,
        total: countResult[0].count,
        pages: Math.ceil(countResult[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  } finally {
    connection.release();
  }
};

// Get payment method statistics
export const getPaymentStats = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const [stats]: any = await connection.query(
      `SELECT 
        pm.code,
        pm.name,
        COUNT(*) as total_count,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(p.amount) as total_amount,
        AVG(CASE 
          WHEN p.status = 'completed' 
          THEN TIMESTAMPDIFF(MINUTE, p.created_at, p.updated_at)
          ELSE NULL 
        END) as avg_completion_time
      FROM payments p
      JOIN payment_methods pm ON p.payment_method_id = pm.id
      GROUP BY pm.code, pm.name`
    );

    res.json(stats);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Error fetching payment stats' });
  } finally {
    connection.release();
  }
};

// Update payment method configuration
export const updatePaymentMethod = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { name, description, is_active, config } = req.body;

    await connection.query(
      `UPDATE payment_methods 
       SET name = ?,
           description = ?,
           is_active = ?,
           config = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [name, description, is_active, JSON.stringify(config), id]
    );

    await connection.commit();
    res.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: 'Error updating payment method' });
  } finally {
    connection.release();
  }
};

// Cancel payment
export const cancelPayment = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    await connection.query(
      `UPDATE payments 
       SET status = 'cancelled',
           error_message = ?,
           updated_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [reason, id]
    );

    // Update order status
    await connection.query(
      `UPDATE orders o
       JOIN payments p ON p.order_id = o.id
       SET o.payment_status = 'cancelled'
       WHERE p.id = ?`,
      [id]
    );

    await connection.commit();
    res.json({ message: 'Payment cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling payment:', error);
    res.status(500).json({ message: 'Error cancelling payment' });
  } finally {
    connection.release();
  }
}; 