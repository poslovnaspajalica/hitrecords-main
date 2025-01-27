import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from '../controllers/cartController';
import { validateCartItem } from '../middleware/validation';

const router = express.Router();

router.get('/', getCart as express.RequestHandler);
router.post('/items', validateCartItem, addToCart as express.RequestHandler);
router.put('/items/:id', validateCartItem, updateCartItem as express.RequestHandler);
router.delete('/items/:id', removeFromCart as express.RequestHandler);

export default router; 