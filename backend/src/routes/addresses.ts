import express from 'express';
import { auth } from '../middleware/auth';
import { validateAddress } from '../middleware/validation';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController';

const router = express.Router();

router.get('/', auth, getUserAddresses as express.RequestHandler);
router.post('/', auth, validateAddress, addAddress as express.RequestHandler);
router.put('/:id', auth, validateAddress, updateAddress as express.RequestHandler);
router.delete('/:id', auth, deleteAddress as express.RequestHandler);

export default router; 