import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  cancelOrder,
  getOrderInvoice
} from '../controllers/orderController';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { validateOrder, validateOrderStatus } from '../middleware/validation';

const router = express.Router();

// Customer routes
router.post('/', auth, validateOrder, createOrder as express.RequestHandler);
router.get('/', auth, getUserOrders as express.RequestHandler);
router.get('/:id', auth, getOrder as express.RequestHandler);
router.post('/:id/cancel', auth, cancelOrder as express.RequestHandler);
router.get('/:id/invoice', auth, getOrderInvoice as express.RequestHandler);

// Admin routes
router.get('/admin/all', auth, adminOnly, getAllOrders as express.RequestHandler);
router.get('/admin/stats', auth, adminOnly, getOrderStats as express.RequestHandler);
router.patch('/admin/:id/status', auth, adminOnly, validateOrderStatus, updateOrderStatus as express.RequestHandler);

export default router; 