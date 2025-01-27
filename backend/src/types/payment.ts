export interface PaymentWebhookData {
  orderId: string;
  status: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface WebhookValidationData {
  payload: any;
  signature: string;
  timestamp: string;
  secretKey: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  status: 'completed' | 'pending' | 'failed';
  amount: number;
  currency: string;
  paymentMethod: string;
} 