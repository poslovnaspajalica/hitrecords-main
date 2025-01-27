import { Request, Response } from 'express';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Get user addresses
export const getUserAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const [addresses]: any = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ?',
      [userId]
    );
    
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

// Add new address
export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { type, street, city, postalCode, countryCode, phone, isDefault } = req.body;
    
    // If this is the first address or isDefault is true, set all other addresses of same type to non-default
    if (isDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = ? AND type = ?',
        [userId, type]
      );
    }
    
    const addressId = uuidv4();
    await pool.query(
      `INSERT INTO user_addresses 
       (id, user_id, type, street, city, postal_code, country_code, phone, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [addressId, userId, type, street, city, postalCode, countryCode, phone, isDefault]
    );
    
    res.status(201).json({
      message: 'Address added successfully',
      addressId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding address' });
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;
    
    // Check if address belongs to user
    const [addresses]: any = await pool.query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (addresses.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If setting as default, update other addresses
    if (updates.isDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = ? AND type = ?',
        [userId, updates.type || addresses[0].type]
      );
    }
    
    await pool.query(
      'UPDATE user_addresses SET ? WHERE id = ?',
      [updates, id]
    );
    
    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address' });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    
    const [result]: any = await pool.query(
      'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
}; 