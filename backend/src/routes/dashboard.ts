import express from 'express';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { RequestHandler } from 'express';
import {
  getDeliveryMetrics,
  getProviderMetrics,
  getDailyMetrics,
  getLocationMetrics,
  getIssueMetrics,
  getPerformanceMetrics,
  getStatusDistribution,
  getDeliveryTimeDistribution,
  getShipmentTrends,
  getDeliveryPerformanceTrends
} from '../controllers/dashboardController';

const router = express.Router();

router.get(
  '/metrics/delivery',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getDeliveryMetrics as RequestHandler
);

router.get(
  '/metrics/providers',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getProviderMetrics as RequestHandler
);

router.get(
  '/metrics/daily',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getDailyMetrics as RequestHandler
);

router.get(
  '/metrics/locations',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getLocationMetrics as RequestHandler
);

router.get(
  '/metrics/issues',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getIssueMetrics as RequestHandler
);

router.get(
  '/metrics/performance',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getPerformanceMetrics as RequestHandler
);

router.get(
  '/visualizations/status-distribution',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getStatusDistribution as RequestHandler
);

router.get(
  '/visualizations/delivery-time-distribution',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getDeliveryTimeDistribution as RequestHandler
);

router.get(
  '/visualizations/shipment-trends',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getShipmentTrends as RequestHandler
);

router.get(
  '/visualizations/delivery-performance-trends',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getDeliveryPerformanceTrends as RequestHandler
);

export default router; 