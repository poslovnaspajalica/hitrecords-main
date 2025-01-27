import PDFDocument from 'pdfkit';
import { Stream } from 'stream';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
}

export const generateInvoicePDF = (order: OrderData): Stream => {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();

  // Company info
  doc.fontSize(12).text('Hit Music Shop d.o.o.');
  doc.text('Ilica 123');
  doc.text('10000 Zagreb');
  doc.text('Croatia');
  doc.text('VAT: HR12345678901');
  doc.moveDown();

  // Order info
  doc.text(`Invoice Number: ${order.id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  // Customer info
  doc.text('Bill to:');
  doc.text(order.customerName);
  doc.text(order.customerEmail);
  doc.text(order.shippingAddress.street);
  doc.text(`${order.shippingAddress.postalCode} ${order.shippingAddress.city}`);
  doc.text(order.shippingAddress.country);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  doc.font('Helvetica-Bold');
  doc.text('Item', 50, tableTop);
  doc.text('Quantity', 250, tableTop);
  doc.text('Price', 350, tableTop);
  doc.text('Total', 450, tableTop);

  // Table content
  let tableY = tableTop + 20;
  doc.font('Helvetica');
  
  order.items.forEach(item => {
    doc.text(item.name, 50, tableY);
    doc.text(item.quantity.toString(), 250, tableY);
    doc.text(`€${item.price.toFixed(2)}`, 350, tableY);
    doc.text(`€${(item.quantity * item.price).toFixed(2)}`, 450, tableY);
    tableY += 20;
  });

  // Totals
  const totalsY = tableY + 20;
  doc.text('Subtotal:', 350, totalsY);
  doc.text(`€${(order.totalAmount - order.shippingFee).toFixed(2)}`, 450, totalsY);
  
  doc.text('Shipping:', 350, totalsY + 20);
  doc.text(`€${order.shippingFee.toFixed(2)}`, 450, totalsY + 20);
  
  doc.font('Helvetica-Bold');
  doc.text('Total:', 350, totalsY + 40);
  doc.text(`€${order.totalAmount.toFixed(2)}`, 450, totalsY + 40);

  // Footer
  doc.fontSize(10).text(
    'Thank you for your business!',
    50,
    doc.page.height - 100,
    { align: 'center' }
  );

  doc.end();
  return doc;
}; 