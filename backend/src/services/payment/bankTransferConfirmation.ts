import pool from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

interface BankTransferConfirmation {
  paymentId: string;
  amount: number;
  bankAccount: string;
  referenceNumber: string;
  transactionDate: Date;
  notes?: string;
}

export async function confirmBankTransfer(data: BankTransferConfirmation) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Create confirmation record
    const confirmationId = uuidv4();
    await connection.query(
      `INSERT INTO payment_confirmations 
       (id, payment_id, confirmation_data, status, processed_at)
       VALUES (?, ?, ?, 'confirmed', NOW())`,
      [
        confirmationId,
        data.paymentId,
        JSON.stringify({
          amount: data.amount,
          bankAccount: data.bankAccount,
          referenceNumber: data.referenceNumber,
          transactionDate: data.transactionDate,
          notes: data.notes
        })
      ]
    );

    // Update payment status
    await connection.query(
      `UPDATE payments 
       SET status = 'completed', 
           updated_at = NOW()
       WHERE id = ?`,
      [data.paymentId]
    );

    // Update order payment status
    await connection.query(
      `UPDATE orders o
       JOIN payments p ON p.order_id = o.id
       SET o.payment_status = 'completed'
       WHERE p.id = ?`,
      [data.paymentId]
    );

    await connection.commit();

    return {
      success: true,
      confirmationId
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getBankTransferPayments(status?: string) {
  const connection = await pool.getConnection();

  try {
    let query = `
      SELECT 
        p.*,
        o.id as order_id,
        o.total_amount,
        u.email,
        u.first_name,
        u.last_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE pm.code = 'bank_transfer'
    `;

    if (status) {
      query += ` AND p.status = ?`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const [payments]: any = await connection.query(
      query,
      status ? [status] : []
    );

    return payments.map((p: any) => ({
      ...p,
      payment_data: JSON.parse(p.payment_data)
    }));
  } finally {
    connection.release();
  }
} 