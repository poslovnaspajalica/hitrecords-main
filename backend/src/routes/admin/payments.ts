import express from 'express';
import { auth } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';
import { RequestHandler } from 'express';
import {
  getPayments,
  getPaymentStats,
  updatePaymentMethod,
  cancelPayment
} from '../../controllers/admin/paymentController';
import { validatePaymentMethodUpdate, validatePaymentCancel } from '../../middleware/validateAdminRequest';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(auth as RequestHandler, adminOnly as RequestHandler);

// Get payments with filtering and pagination
router.get(
  '/list',
  getPayments as RequestHandler
);

// Get payment statistics
router.get(
  '/stats',
  getPaymentStats as RequestHandler
);

// Update payment method configuration
router.put(
  '/methods/:id',
  validatePaymentMethodUpdate as RequestHandler,
  updatePaymentMethod as RequestHandler
);

// Cancel payment
router.post(
  '/:id/cancel',
  validatePaymentCancel as RequestHandler,
  cancelPayment as RequestHandler
);

export default router; 