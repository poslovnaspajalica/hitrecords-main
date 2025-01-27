import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate entry found'
    });
  }

  // Default error response
  res.status(statusCode).json({
    status: 'error',
    message
  });
}; 