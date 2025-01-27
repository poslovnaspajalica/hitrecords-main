import express from 'express';
import { 
  getProducts, 
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { validateProduct } from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/', getProducts as express.RequestHandler);
router.get('/:slug', getProduct as express.RequestHandler);

// Admin routes
router.post('/', auth, adminOnly, validateProduct, createProduct as express.RequestHandler);
router.put('/:id', auth, adminOnly, validateProduct, updateProduct as express.RequestHandler);
router.delete('/:id', auth, adminOnly, deleteProduct as express.RequestHandler);

export default router;