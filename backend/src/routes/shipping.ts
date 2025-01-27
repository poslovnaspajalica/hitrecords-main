import express from 'express';
import { auth } from '../middleware/auth';
import {
  getShippingZones,
  getShippingRates,
  calculateShipping,
  createZone,
  updateZone,
  deleteZone,
  addShippingRate,
  getBoxNowPickupPoints,
  getShippingProviders,
  getAllShipments,
  getShipmentDetails,
  updateShipmentTracking,
  bulkUpdateTracking,
  exportShipmentsData,
  getFilterOptions
} from '../controllers/shippingController';
import { adminOnly } from '../middleware/adminOnly';
import { bulkActionLimiter } from '../middleware/rateLimiting';
import { RequestHandler } from 'express';

const router = express.Router();

// Public routes
router.get('/zones', getShippingZones as express.RequestHandler);
router.get('/rates/:zoneId', getShippingRates as express.RequestHandler);
router.post('/calculate', calculateShipping as express.RequestHandler);

// Protected routes
router.post('/zones', auth, createZone as express.RequestHandler);
router.put('/zones/:id', auth, updateZone as express.RequestHandler);
router.delete('/zones/:id', auth, deleteZone as express.RequestHandler);
router.post('/rates', auth, addShippingRate as express.RequestHandler);
router.get('/pickup-points', getBoxNowPickupPoints as express.RequestHandler);
router.get('/providers', getShippingProviders as express.RequestHandler);

// Admin routes
router.get('/admin/shipments', auth, adminOnly, getAllShipments as express.RequestHandler);
router.get('/admin/shipments/:id', auth, adminOnly, getShipmentDetails as express.RequestHandler);
router.post('/admin/shipments/:id/update-tracking', auth, adminOnly, updateShipmentTracking as express.RequestHandler);
router.post(
  '/admin/shipments/bulk-update',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  bulkActionLimiter as RequestHandler,
  bulkUpdateTracking as RequestHandler
);
router.get(
  '/admin/shipments/export',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  exportShipmentsData as RequestHandler
);
router.get(
  '/admin/filter-options',
  auth as RequestHandler,
  adminOnly as RequestHandler,
  getFilterOptions as RequestHandler
);

export default router; 