import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.string().transform((v) => v === 'true').optional(),
  search: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
