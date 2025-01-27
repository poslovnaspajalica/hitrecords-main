import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
  me
} from '../controllers/authController';
import { auth } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register as express.RequestHandler);
router.post('/login', validateLogin, login as express.RequestHandler);
router.post('/forgot-password', validateForgotPassword, forgotPassword as express.RequestHandler);
router.post('/reset-password', validateResetPassword, resetPassword as express.RequestHandler);
router.get('/verify-email/:token', verifyEmail as express.RequestHandler);

// Protected routes
router.get('/me', auth, me as express.RequestHandler);
router.post('/change-password', auth, validateChangePassword, changePassword as express.RequestHandler);
router.post('/resend-verification', auth, resendVerification as express.RequestHandler);

export default router; 