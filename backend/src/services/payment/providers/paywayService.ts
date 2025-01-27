import axios from 'axios';
import crypto from 'crypto';
import { PaymentProvider, PaymentInitializeOptions, PaymentResult } from '../types';

export class PayWayService implements PaymentProvider {
  private generateSignature(data: any, secretKey: string): string {
    const signString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('');

    return crypto
      .createHmac('sha512', secretKey)
      .update(signString)
      .digest('hex');
  }

  async initializePayment(options: PaymentInitializeOptions): Promise<PaymentResult> {
    try {
      const { shopId, secretKey, mode } = options.config;
      const baseUrl = mode === 'test' 
        ? 'https://test.payway.com.hr/api/v2'
        : 'https://payway.com.hr/api/v2';

      const paymentData = {
        ShopID: shopId,
        OrderNumber: options.orderId,
        TotalAmount: Math.round(options.amount * 100), // Convert to cents
        Currency: options.currency,
        Lang: 'hr',
        ReturnURL: `${process.env.FRONTEND_URL}/checkout/success`,
        CancelURL: `${process.env.FRONTEND_URL}/checkout/cancel`,
        ReturnErrorURL: `${process.env.FRONTEND_URL}/checkout/error`,
        ReturnMethod: 'POST',
        TimeStamp: Math.floor(Date.now() / 1000)
      };

      const signature = this.generateSignature(paymentData, secretKey);

      const response = await axios.post(
        `${baseUrl}/transactions`,
        {
          ...paymentData,
          Signature: signature
        }
      );

      return {
        success: true,
        status: 'pending',
        transactionId: response.data.PaymentID,
        redirectUrl: response.data.PaymentURL,
        providerData: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'error',
        errorMessage: error.response?.data?.ErrorMessage || error.message
      };
    }
  }

  async processPayment(paymentData: any): Promise<PaymentResult> {
    // PayWay processes payment on their side
    return {
      success: true,
      status: 'pending',
      transactionId: paymentData.PaymentID
    };
  }

  async validateWebhook(payload: any): Promise<boolean> {
    const { Signature, ...data } = payload;
    const calculatedSignature = this.generateSignature(data, process.env.PAYWAY_SECRET_KEY!);
    return calculatedSignature === Signature;
  }

  async handleWebhook(payload: any): Promise<PaymentResult> {
    const status = payload.Status;
    
    switch (status) {
      case 'Authorized':
      case 'Paid':
        return {
          success: true,
          status: 'completed',
          transactionId: payload.PaymentID,
          providerData: payload
        };
      case 'Declined':
      case 'Canceled':
        return {
          success: false,
          status: 'failed',
          transactionId: payload.PaymentID,
          errorMessage: payload.ErrorMessage,
          providerData: payload
        };
      default:
        return {
          success: true,
          status: 'pending',
          transactionId: payload.PaymentID,
          providerData: payload
        };
    }
  }
} 