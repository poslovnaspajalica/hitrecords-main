import nodemailer from 'nodemailer';
import { getOrderStatusEmailTemplate, getPaymentConfirmationTemplate, getPaymentFailedTemplate } from '../utils/emailTemplates';
import pool from '../config/database';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendOrderStatusEmail = async (
  email: string,
  orderData: {
    id: string;
    status: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    trackingNumber?: string;
  }
) => {
  const mailOptions = {
    from: `"Hit Music Shop" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Order Status Update - ${orderData.id}`,
    html: getOrderStatusEmailTemplate(orderData)
  };

  await transporter.sendMail(mailOptions);
};

interface PaymentInstructions {
  amount: number;
  currency: string;
  bankAccount: string;
  bankName: string;
  recipient: string;
  referenceNumber: string;
  description: string;
}

export async function sendPaymentInstructions(orderId: string, instructions: PaymentInstructions) {
  const connection = await pool.getConnection();
  
  try {
    // Dohvati podatke o narudžbi i kupcu
    const [orders]: any = await connection.query(
      `SELECT o.*, u.email, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (!orders.length) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    const template = `
      <h2>Upute za plaćanje</h2>
      <p>Poštovani ${order.first_name},</p>
      <p>Hvala vam na narudžbi broj ${orderId}. Molimo izvršite uplatu prema sljedećim uputama:</p>
      <table>
        <tr>
          <td><strong>Iznos:</strong></td>
          <td>${instructions.amount} ${instructions.currency}</td>
        </tr>
        <tr>
          <td><strong>IBAN:</strong></td>
          <td>${instructions.bankAccount}</td>
        </tr>
        <tr>
          <td><strong>Banka:</strong></td>
          <td>${instructions.bankName}</td>
        </tr>
        <tr>
          <td><strong>Primatelj:</strong></td>
          <td>${instructions.recipient}</td>
        </tr>
        <tr>
          <td><strong>Poziv na broj:</strong></td>
          <td>${instructions.referenceNumber}</td>
        </tr>
        <tr>
          <td><strong>Opis plaćanja:</strong></td>
          <td>${instructions.description}</td>
        </tr>
      </table>
      <p>Nakon izvršene uplate, obrada može potrajati do 24 sata.</p>
      <p>Vaša narudžba bit će poslana nakon što primimo uplatu.</p>
    `;

    await sendEmail({
      to: order.email,
      subject: `Upute za plaćanje - Narudžba ${orderId}`,
      html: template
    });
  } finally {
    connection.release();
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const mailOptions = {
    from: `"Hit Music Shop" <${process.env.SMTP_FROM}>`,
    ...options
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPaymentConfirmation(orderId: string) {
  const connection = await pool.getConnection();
  
  try {
    const [orders]: any = await connection.query(
      `SELECT 
        o.*,
        u.email,
        u.first_name,
        u.last_name,
        pm.name as payment_method_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN payment_methods pm ON o.payment_method_id = pm.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
      GROUP BY o.id`,
      [orderId]
    );

    if (!orders.length) {
      throw new Error('Order not found');
    }

    const order = orders[0];
    const items = JSON.parse(order.items);

    await sendEmail({
      to: order.email,
      subject: `Potvrda plaćanja - Narudžba ${orderId}`,
      html: getPaymentConfirmationTemplate({
        orderId,
        customerName: `${order.first_name} ${order.last_name}`,
        amount: order.total_amount,
        currency: 'EUR',
        paymentMethod: order.payment_method_name,
        items
      })
    });
  } finally {
    connection.release();
  }
}

export async function sendPaymentFailedNotification(orderId: string, errorMessage: string) {
  const connection = await pool.getConnection();
  
  try {
    const [orders]: any = await connection.query(
      `SELECT o.*, u.email, u.first_name, u.last_name, pm.name as payment_method_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN payment_methods pm ON o.payment_method_id = pm.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (!orders.length) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    await sendEmail({
      to: order.email,
      subject: `Neuspjelo plaćanje - Narudžba ${orderId}`,
      html: getPaymentFailedTemplate({
        orderId,
        customerName: `${order.first_name} ${order.last_name}`,
        errorMessage,
        paymentMethod: order.payment_method_name
      })
    });
  } finally {
    connection.release();
  }
} 