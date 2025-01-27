import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { loggingMiddleware } from './middleware/logging';
import { trackingUpdateService } from './services/trackingUpdateService';
import { webhookRetryService } from './services/webhookRetryService';
import { batchSchedulerService } from './services/batchSchedulerService';

// Routes
import productRoutes from './routes/products';
import shippingRoutes from './routes/shipping';
import authRoutes from './routes/auth';
import addressRoutes from './routes/addresses';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import webhookRoutes from './routes/webhooks';
import dashboardRoutes from './routes/dashboard';
import paymentRoutes from './routes/payments';
import checkoutRoutes from './routes/checkout';
import adminPaymentRoutes from './routes/admin/payments';

dotenv.config();

const app = express();

// Rate limiter konfiguracija
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100, // limit svake IP na 100 zahtjeva po windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Primjenjujemo rate limiter samo na API rute
app.use('/api', apiLimiter);

// Basic route za provjeru
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Hit Music Shop API' });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start services
if (process.env.NODE_ENV !== 'test') {
  trackingUpdateService.start();
  webhookRetryService.start();
  batchSchedulerService.initialize();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  trackingUpdateService.stop();
  webhookRetryService.stop();
  batchSchedulerService.stopAll();
  process.exit(0);
});

export default app;