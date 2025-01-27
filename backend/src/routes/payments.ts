import express from 'express';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { RequestHandler } from 'express';
import {
  getPaymentMethods,
  initializePayment,
  processPayment,
  getPaymentDetails,
  confirmBankTransferPayment,
  getBankTransferPaymentsList
} from '../controllers/paymentController';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods as RequestHandler);

// Protected routes
router.post(
  '/initialize',
  auth as RequestHandler,
  initializePayment as RequestHandler
);

router.post(
  '/:paymentId/process',
  auth as RequestHandler,
  processPayment as RequestHandler
);

router.get(
  '/:paymentId',
  auth as RequestHandler,
  getPaymentDetails as RequestHandler
);

// Admin routes
router.post(
  '/bank-transfer/confirm',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  confirmBankTransferPayment as RequestHandler
);

router.get(
  '/bank-transfer/list',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getBankTransferPaymentsList as RequestHandler
);

export default router; 