import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  street: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  countryCode: z.string().length(2),
  phone: z.string().optional(),
  isDefault: z.boolean().optional().default(false)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  newPassword: z.string().min(6)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().int().min(0),
  weight: z.number().positive().optional(),
  isFeatured: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  attributes: z.record(z.string(), z.string()).optional()
});

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional()
});

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive()
});

const orderSchema = z.object({
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid(),
  paymentMethod: z.enum(['credit_card', 'paypal']),
  shippingMethod: z.object({
    provider: z.string(),
    rateId: z.string(),
    pickupPointId: z.string().optional()
  }),
  notes: z.string().optional()
});

const orderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
  trackingNumber: z.string().optional()
});

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateAddress = (req: Request, res: Response, next: NextFunction) => {
  try {
    addressSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  try {
    forgotPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
  try {
    resetPasswordSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
  try {
    changePasswordSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  try {
    productSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  try {
    categorySchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateCartItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.method === 'PUT') {
      // Za update validiramo samo quantity
      z.object({ quantity: z.number().int().positive() }).parse(req.body);
    } else {
      cartItemSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  try {
    orderSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
};

export const validateOrderStatus = (req: Request, res: Response, next: NextFunction) => {
  try {
    orderStatusSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid input data', error });
  }
}; 