import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validatePaymentMethodUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    is_active: z.boolean(),
    config: z.record(z.any())
  });

  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Invalid request data',
      errors: (error as z.ZodError).errors
    });
  }
};

export const validatePaymentCancel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    reason: z.string().min(1).max(500)
  });

  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Invalid request data',
      errors: (error as z.ZodError).errors
    });
  }
}; 