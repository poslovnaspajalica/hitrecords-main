import express from 'express';
import { auth } from '../middleware/auth';
import { RequestHandler } from 'express';
import { processCheckout, handlePaymentReturn } from '../controllers/checkoutController';
import { validateCheckout } from '../middleware/validateCheckout';

const router = express.Router();

router.post(
  '/',
  auth as RequestHandler,
  validateCheckout as RequestHandler,
  processCheckout as RequestHandler
);

router.get(
  '/payment/return',
  handlePaymentReturn as RequestHandler
);

export default router; 