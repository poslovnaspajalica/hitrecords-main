import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import path from 'path';

interface EmailData {
  template: string;
  data: {
    id: string;
    status: string;
    customerName: string;
    items: any[];
    totalAmount: number;
    trackingNumber?: string;
    [key: string]: any;
  };
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  private static getTemplate(templateName: string) {
    const templatePath = path.join(__dirname, `../templates/${templateName}.hbs`);
    const template = readFileSync(templatePath, 'utf-8');
    return compile(template);
  }

  public static async send(to: string, emailData: EmailData): Promise<void> {
    try {
      const template = this.getTemplate(emailData.template);
      const html = template(emailData.data);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: this.getSubject(emailData.template, emailData.data),
        html
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private static getSubject(template: string, data: any): string {
    switch (template) {
      case 'order-status-update':
        return `Order #${data.id} Status Update: ${data.status}`;
      case 'payment-confirmation':
        return `Payment Confirmation for Order #${data.id}`;
      case 'payment-failed':
        return `Payment Failed for Order #${data.id}`;
      default:
        return 'Hit Records Shop Notification';
    }
  }
} 