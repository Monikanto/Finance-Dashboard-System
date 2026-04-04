import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/apiResponse';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';

  // AppError (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Prisma known request errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      statusCode = 409;
      const target = prismaErr.meta?.target;
      message = `Duplicate value for field: ${Array.isArray(target) ? target.join(', ') : target}`;
    } else if (prismaErr.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database operation failed';
    }
  }

  // Prisma validation errors
  if (err.constructor.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      stack: err.stack,
    });
  }

  return sendError(res, statusCode, message);
};
