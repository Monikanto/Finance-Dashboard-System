import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { config } from '../../config';
import { AppError } from '../../utils/appError';
import { SignupInput, LoginInput } from './auth.schema';

export class AuthService {
  static async signup(data: SignupInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = AuthService.generateToken(user.id, user.email, user.role);

    return { user, token };
  }

  static async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.deletedAt) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = AuthService.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  static generateToken(id: string, email: string, role: string): string {
    return jwt.sign(
      { id, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as string }
    );
  }
}
