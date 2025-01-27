import crypto from 'crypto';
import { WebhookValidationData, PaymentWebhookData } from '../../types/payment';

export const paypalWebhookHandler = {
  validateWebhook(data: WebhookValidationData): boolean {
    // PayPal webhook validation
    const { payload, signature, timestamp, secretKey } = data;
    
    const webhookBody = JSON.stringify(payload);
    const signString = `${timestamp}|${webhookBody}`;
    
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signString);
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
  },

  parseWebhookData(payload: any): PaymentWebhookData {
    const resource = payload.resource;
    
    return {
      orderId: resource.custom_id,
      status: resource.status,
      amount: parseFloat(resource.amount.value),
      currency: resource.amount.currency_code,
      transactionId: resource.id,
      metadata: {
        paypalTransactionId: resource.id,
        paymentSource: resource.payment_source,
        createTime: resource.create_time,
        updateTime: resource.update_time
      }
    };
  }
};

function mapPayWayStatus(status: string): string {
  switch (status) {
    case 'Authorized':
    case 'Paid':
      return 'completed';
    case 'Declined':
    case 'Canceled':
      return 'failed';
    case 'Pending':
      return 'pending';
    default:
      return 'unknown';
  }
}

export const paywayWebhookHandler = {
  validateWebhook(data: WebhookValidationData): boolean {
    const { payload, signature, secretKey } = data;
    
    // Sort payload keys and create string for signing
    const signString = Object.keys(payload)
      .sort()
      .filter(key => key !== 'Signature')
      .map(key => `${key}=${payload[key]}`)
      .join('');
    
    const hmac = crypto.createHmac('sha512', secretKey);
    hmac.update(signString);
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
  },

  parseWebhookData(payload: any): PaymentWebhookData {
    return {
      orderId: payload.OrderNumber,
      status: mapPayWayStatus(payload.Status),
      amount: payload.Amount / 100, // Convert from cents
      currency: payload.Currency,
      transactionId: payload.PaymentID,
      errorCode: payload.ErrorCode,
      errorMessage: payload.ErrorMessage,
      metadata: {
        paywayTransactionId: payload.PaymentID,
        pgwOrderId: payload.PgwOrderId,
        authorizationType: payload.AuthorizationType,
        timestamp: payload.Timestamp
      }
    };
  }
};

export const bankTransferWebhookHandler = {
  validateWebhook(data: WebhookValidationData): boolean {
    // Bank transfer webhooks are internal, validate API key
    return data.secretKey === process.env.INTERNAL_WEBHOOK_KEY;
  },

  parseWebhookData(payload: any): PaymentWebhookData {
    return {
      orderId: payload.orderId,
      status: 'completed',
      amount: payload.amount,
      currency: payload.currency,
      transactionId: payload.confirmationId,
      metadata: {
        bankAccount: payload.bankAccount,
        referenceNumber: payload.referenceNumber,
        confirmationDate: payload.confirmationDate,
        notes: payload.notes
      }
    };
  }
};

export const webhookHandlers = new Map([
  ['paypal', paypalWebhookHandler],
  ['payway', paywayWebhookHandler],
  ['bank_transfer', bankTransferWebhookHandler]
]); 