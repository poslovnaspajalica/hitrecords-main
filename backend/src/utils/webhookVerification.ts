import crypto from 'crypto';

interface VerificationConfig {
  secret: string;
  algorithm: string;
  encoding: BufferEncoding;
}

const providerConfigs: { [key: string]: VerificationConfig } = {
  hp_express: {
    secret: process.env.HP_EXPRESS_WEBHOOK_SECRET!,
    algorithm: 'sha256',
    encoding: 'hex'
  },
  dhl: {
    secret: process.env.DHL_WEBHOOK_SECRET!,
    algorithm: 'sha256',
    encoding: 'base64'
  },
  overseas: {
    secret: process.env.OVERSEAS_WEBHOOK_SECRET!,
    algorithm: 'sha1',
    encoding: 'hex'
  },
  boxnow: {
    secret: process.env.BOXNOW_WEBHOOK_SECRET!,
    algorithm: 'sha256',
    encoding: 'hex'
  }
};

export function verifyWebhookSignature(
  provider: string,
  payload: any,
  signature: string
): boolean {
  const config = providerConfigs[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  try {
    switch (provider) {
      case 'hp_express':
        return verifyHPExpressSignature(payload, signature, config);
      case 'dhl':
        return verifyDHLSignature(payload, signature, config);
      case 'overseas':
        return verifyOverseasSignature(payload, signature, config);
      case 'boxnow':
        return verifyBoxNowSignature(payload, signature, config);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error verifying ${provider} webhook signature:`, error);
    return false;
  }
}

function verifyHPExpressSignature(
  payload: any,
  signature: string,
  config: VerificationConfig
): boolean {
  // HP Express koristi timestamp + payload + secret
  const timestamp = payload.timestamp;
  const stringToSign = `${timestamp}.${JSON.stringify(payload)}`;
  
  const expectedSignature = crypto
    .createHmac(config.algorithm, config.secret)
    .update(stringToSign)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function verifyDHLSignature(
  payload: any,
  signature: string,
  config: VerificationConfig
): boolean {
  // DHL koristi samo payload + secret
  const stringToSign = JSON.stringify(payload);
  
  const expectedSignature = crypto
    .createHmac(config.algorithm, config.secret)
    .update(stringToSign)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function verifyOverseasSignature(
  payload: any,
  signature: string,
  config: VerificationConfig
): boolean {
  // Overseas koristi sorted payload keys + secret
  const sortedKeys = Object.keys(payload).sort();
  const stringToSign = sortedKeys
    .map(key => `${key}=${payload[key]}`)
    .join('&');
  
  const expectedSignature = crypto
    .createHmac(config.algorithm, config.secret)
    .update(stringToSign)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function verifyBoxNowSignature(
  payload: any,
  signature: string,
  config: VerificationConfig
): boolean {
  // BoxNow koristi timestamp + payload + secret
  const timestamp = payload.timestamp;
  const stringToSign = `${timestamp}${JSON.stringify(payload)}`;
  
  const expectedSignature = crypto
    .createHmac(config.algorithm, config.secret)
    .update(stringToSign)
    .digest('hex');

  return signature === expectedSignature;
}