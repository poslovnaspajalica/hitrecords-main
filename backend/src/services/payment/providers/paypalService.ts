import axios from 'axios';
import { PaymentProvider, PaymentInitializeOptions, PaymentResult } from '../types';

export class PayPalService implements PaymentProvider {
  private async getAccessToken(clientId: string, clientSecret: string, mode: string): Promise<string> {
    const baseUrl = mode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const response = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: clientId,
          password: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  }

  async initializePayment(options: PaymentInitializeOptions): Promise<PaymentResult> {
    try {
      const { clientId, clientSecret, mode } = options.config;
      const baseUrl = mode === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

      const accessToken = await this.getAccessToken(clientId, clientSecret, mode);

      const response = await axios.post(
        `${baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: options.orderId,
            amount: {
              currency_code: options.currency,
              value: options.amount.toFixed(2)
            }
          }],
          application_context: {
            return_url: `${process.env.FRONTEND_URL}/checkout/success`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        status: 'pending',
        transactionId: response.data.id,
        redirectUrl: response.data.links.find((link: any) => link.rel === 'approve').href,
        providerData: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'error',
        errorMessage: error.response?.data?.message || error.message
      };
    }
  }

  async processPayment(paymentData: any): Promise<PaymentResult> {
    try {
      const { clientId, clientSecret, mode } = paymentData.config;
      const baseUrl = mode === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

      const accessToken = await this.getAccessToken(clientId, clientSecret, mode);

      const response = await axios.post(
        `${baseUrl}/v2/checkout/orders/${paymentData.orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        status: 'completed',
        transactionId: response.data.id,
        providerData: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'error',
        errorMessage: error.response?.data?.message || error.message
      };
    }
  }

  async validateWebhook(payload: any): Promise<boolean> {
    // PayPal webhook validation logic
    // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
    return true; // TODO: Implement proper validation
  }

  async handleWebhook(payload: any): Promise<PaymentResult> {
    const event = payload.event_type;
    const resource = payload.resource;

    switch (event) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        return {
          success: true,
          status: 'completed',
          transactionId: resource.id,
          providerData: resource
        };
      case 'PAYMENT.CAPTURE.DENIED':
        return {
          success: false,
          status: 'failed',
          transactionId: resource.id,
          errorMessage: 'Payment was denied',
          providerData: resource
        };
      default:
        return {
          success: true,
          status: 'pending',
          transactionId: resource.id,
          providerData: resource
        };
    }
  }
} 