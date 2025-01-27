import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [users]: any = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (!users.length || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ message: 'Error checking admin status' });
  }
}; 