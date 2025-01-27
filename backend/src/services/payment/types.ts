export interface PaymentConfig {
  [key: string]: any;
}

export interface PaymentInitializeOptions {
  orderId: string;
  amount: number;
  currency: string;
  config: PaymentConfig;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: string;
  errorMessage?: string;
  redirectUrl?: string;
  providerData?: any;
}

export interface PaymentProvider {
  initializePayment(options: PaymentInitializeOptions): Promise<PaymentResult>;
  processPayment(paymentData: any): Promise<PaymentResult>;
  validateWebhook(payload: any): Promise<boolean>;
  handleWebhook(payload: any): Promise<PaymentResult>;
} 