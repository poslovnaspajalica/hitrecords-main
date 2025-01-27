export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  requires_confirmation: boolean;
}

export interface PaymentFormData {
  methodId: string;
  paypalEmail?: string;
  cardholderName?: string;
}

export interface PaymentResponse {
  orderId: string;
  paymentId: string;
  status: 'success' | 'pending' | 'redirect';
  redirectUrl?: string;
  instructions?: {
    amount: number;
    currency: string;
    bankAccount: string;
    bankName: string;
    recipient: string;
    referenceNumber: string;
    description: string;
  };
} 