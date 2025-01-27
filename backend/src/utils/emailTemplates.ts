interface OrderEmailData {
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

export const getOrderStatusEmailTemplate = (data: OrderEmailData): string => {
  const statusMessages = {
    pending: 'We have received your order and are processing it.',
    processing: 'Your order is being prepared for shipping.',
    shipped: `Your order has been shipped! ${data.trackingNumber ? `Tracking number: ${data.trackingNumber}` : ''}`,
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled.'
  };

  const itemsList = data.items
    .map(item => `
      <tr>
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px;">${item.quantity}</td>
        <td style="padding: 10px;">€${item.price.toFixed(2)}</td>
        <td style="padding: 10px;">€${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Order Status Update</h2>
      <p>Hello ${data.customerName},</p>
      <p>${statusMessages[data.status as keyof typeof statusMessages]}</p>
      
      <h3>Order Details (#${data.id})</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
            <th style="padding: 10px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold;">
            <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
            <td style="padding: 10px;">€${data.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <p>
        You can view your order details and track its status by clicking 
        <a href="${process.env.FRONTEND_URL}/orders/${data.id}">here</a>.
      </p>
      
      <p>Thank you for shopping with Hit Music Shop!</p>
    </div>
  `;
};

export const getPaymentConfirmationTemplate = (data: {
  orderId: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}) => `
  <h2>Potvrda plaćanja</h2>
  <p>Poštovani ${data.customerName},</p>
  <p>Vaše plaćanje za narudžbu ${data.orderId} je uspješno provedeno.</p>
  
  <h3>Detalji plaćanja:</h3>
  <table>
    <tr>
      <td><strong>Iznos:</strong></td>
      <td>${data.amount} ${data.currency}</td>
    </tr>
    <tr>
      <td><strong>Način plaćanja:</strong></td>
      <td>${data.paymentMethod}</td>
    </tr>
  </table>

  <h3>Naručeni proizvodi:</h3>
  <table>
    <tr>
      <th>Proizvod</th>
      <th>Količina</th>
      <th>Cijena</th>
    </tr>
    ${data.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price} ${data.currency}</td>
      </tr>
    `).join('')}
  </table>

  <p>Vaša narudžba će uskoro biti poslana.</p>
`;

export const getPaymentFailedTemplate = (data: {
  orderId: string;
  customerName: string;
  errorMessage: string;
  paymentMethod: string;
}) => `
  <h2>Neuspjelo plaćanje</h2>
  <p>Poštovani ${data.customerName},</p>
  <p>Nažalost, plaćanje za narudžbu ${data.orderId} nije uspjelo.</p>
  
  <p><strong>Razlog:</strong> ${data.errorMessage}</p>
  
  <p>Molimo pokušajte ponovno s plaćanjem koristeći sljedeću poveznicu:</p>
  <p><a href="${process.env.FRONTEND_URL}/checkout/retry/${data.orderId}">Pokušaj ponovno</a></p>
  
  <p>Ako i dalje imate problema, molimo kontaktirajte našu podršku.</p>
`; 