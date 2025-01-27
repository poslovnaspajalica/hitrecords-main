import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    name: z.string()
  })).min(1),

  shippingAddress: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    street: z.string().min(5).max(100),
    city: z.string().min(2).max(50),
    postalCode: z.string().min(3).max(10),
    country: z.string().length(2), // ISO country code
    phone: z.string().min(8).max(20)
  }),

  shippingMethod: z.object({
    id: z.string().uuid(),
    price: z.number().nonnegative()
  }),

  payment: z.object({
    methodId: z.string().uuid(),
    returnUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    paypalEmail: z.string().email().optional(),
    cardholderName: z.string().min(3).max(100).optional()
  }),

  totalAmount: z.number().positive()
});

export const validateCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await checkoutSchema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Invalid checkout data',
      errors: (error as z.ZodError).errors
    });
  }
}; 