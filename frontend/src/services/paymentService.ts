import { api } from '../utils/api';
import { PaymentMethod, PaymentResponse } from '../types/payment';

interface ProcessPaymentData {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  payment: {
    methodId: string;
    paypalEmail?: string;
    cardholderName?: string;
  };
}

class PaymentService {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/payments/methods');
    return response.data;
  }

  async processPayment(data: ProcessPaymentData): Promise<PaymentResponse> {
    const response = await api.post('/checkout', {
      items: data.items,
      totalAmount: data.totalAmount,
      payment: data.payment
    });
    return response.data;
  }

  async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await api.get(`/payments/${paymentId}/verify`);
    return response.data;
  }
}

export const paymentService = new PaymentService(); 