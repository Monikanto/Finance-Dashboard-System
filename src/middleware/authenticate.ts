import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/appError';
import prisma from '../lib/prisma';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // 3. Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    if (user.deletedAt) {
      throw new AppError('Your account has been deleted.', 401);
    }

    // 4. Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired. Please log in again.', 401));
    } else {
      next(new AppError('Authentication failed.', 401));
    }
  }
};
