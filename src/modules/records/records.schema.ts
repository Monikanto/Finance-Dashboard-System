import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z.string().min(1, 'Category is required').max(50),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: 'Invalid date format',
  }),
  notes: z.string().max(500).optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date format' })
    .optional(),
  notes: z.string().max(500).optional().nullable(),
});

export const getRecordsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' })
    .optional(),
  endDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' })
    .optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type GetRecordsQuery = z.infer<typeof getRecordsQuerySchema>;
