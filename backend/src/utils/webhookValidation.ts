import crypto from 'crypto';

export interface WebhookValidationData {
  payload: any;
  signature: string;
  timestamp: string;
  secretKey: string;
}

export async function validateWebhookSignature(data: WebhookValidationData): Promise<boolean> {
  const { payload, signature, timestamp, secretKey } = data;
  
  const message = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');

  return signature === expectedSignature;
} 