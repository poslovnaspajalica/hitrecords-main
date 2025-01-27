import express from 'express';
import { handleShippingWebhook, handleManualTrackingUpdate, handlePaymentWebhook } from '../controllers/webhookController';
import { webhookLimiter, manualTrackingLimiter } from '../middleware/rateLimiting';
import { RequestHandler } from 'express';

const router = express.Router();

router.post(
  '/shipping/:provider', 
  webhookLimiter as RequestHandler,
  handleShippingWebhook as RequestHandler
);

router.post(
  '/tracking/manual',
  manualTrackingLimiter as RequestHandler,
  handleManualTrackingUpdate as RequestHandler
);

router.post(
  '/payment/:provider',
  handlePaymentWebhook as RequestHandler
);

export default router;