import { PaymentProvider, PaymentInitializeOptions, PaymentResult } from '../types';

export class CodService implements PaymentProvider {
  async initializePayment(options: PaymentInitializeOptions): Promise<PaymentResult> {
    return {
      success: true,
      status: 'pending',
      providerData: {
        amount: options.amount,
        currency: options.currency
      }
    };
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      success: true,
      status: 'pending',
      transactionId: 'cod-' + Date.now()
    };
  }

  async validateWebhook(): Promise<boolean> {
    return true;
  }

  async handleWebhook(): Promise<PaymentResult> {
    throw new Error('Webhooks not supported for COD payments');
  }
} 