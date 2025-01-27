import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { auth } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { validateCategory } from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/', getCategories as express.RequestHandler);
router.get('/:slug', getCategory as express.RequestHandler);

// Admin routes
router.post('/', auth, adminOnly, validateCategory, createCategory as express.RequestHandler);
router.put('/:id', auth, adminOnly, validateCategory, updateCategory as express.RequestHandler);
router.delete('/:id', auth, adminOnly, deleteCategory as express.RequestHandler);

export default router; 