import { Request, Response, NextFunction } from 'express';

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
}; 