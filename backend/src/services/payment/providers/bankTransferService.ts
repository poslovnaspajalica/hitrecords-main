import { PaymentProvider, PaymentInitializeOptions, PaymentResult } from '../types';
import { sendPaymentInstructions } from '../../emailService';

export class BankTransferService implements PaymentProvider {
  async initializePayment(options: PaymentInitializeOptions): Promise<PaymentResult> {
    try {
      const { bank_account, bank_name, recipient } = options.config;

      // Generiraj poziv na broj
      const referenceNumber = `HR00-${options.orderId.slice(-10)}`;

      const paymentInstructions = {
        amount: options.amount,
        currency: options.currency,
        bankAccount: bank_account,
        bankName: bank_name,
        recipient: recipient,
        referenceNumber,
        description: `Narudžba ${options.orderId}`
      };

      // Pošalji upute za plaćanje na email (implementirati u emailService)
      await sendPaymentInstructions(options.orderId, paymentInstructions);

      return {
        success: true,
        status: 'pending',
        transactionId: `bt-${options.orderId}`,
        providerData: paymentInstructions
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'error',
        errorMessage: error.message
      };
    }
  }

  async processPayment(paymentData: any): Promise<PaymentResult> {
    // Bank transfer payments are processed manually
    return {
      success: true,
      status: 'pending',
      transactionId: paymentData.transactionId
    };
  }

  async validateWebhook(): Promise<boolean> {
    // Bank transfers don't use webhooks
    return false;
  }

  async handleWebhook(): Promise<PaymentResult> {
    throw new Error('Webhooks not supported for bank transfer payments');
  }
} 