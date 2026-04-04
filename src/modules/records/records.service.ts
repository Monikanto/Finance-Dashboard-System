import prisma from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { CreateRecordInput, UpdateRecordInput, GetRecordsQuery } from './records.schema';
import { Prisma } from '@prisma/client';

export class RecordsService {
  static async create(userId: string, data: CreateRecordInput) {
    const record = await prisma.record.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes,
        userId,
      },
    });

    return record;
  }

  static async getAll(userId: string, query: GetRecordsQuery, isAdmin: boolean) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RecordWhereInput = {
      deletedAt: null,
    };

    // Non-admin users can only see their own records
    if (!isAdmin) {
      where.userId = userId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        (where.date as any).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.date as any).lte = new Date(query.endDate);
      }
    }

    if (query.search) {
      where.OR = [
        { category: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[query.sortBy || 'date'] = query.sortOrder || 'desc';

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.record.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string, userId: string, isAdmin: boolean) {
    const record = await prisma.record.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record || record.deletedAt) {
      throw new AppError('Record not found', 404);
    }

    // Non-admin can only see their own records
    if (!isAdmin && record.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return record;
  }

  static async update(id: string, userId: string, data: UpdateRecordInput) {
    const record = await prisma.record.findUnique({ where: { id } });

    if (!record || record.deletedAt) {
      throw new AppError('Record not found', 404);
    }

    if (record.userId !== userId) {
      throw new AppError('You can only update your own records', 403);
    }

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return updatedRecord;
  }

  static async delete(id: string, userId: string, isAdmin: boolean) {
    const record = await prisma.record.findUnique({ where: { id } });

    if (!record || record.deletedAt) {
      throw new AppError('Record not found', 404);
    }

    // Admin can delete any record, others only their own
    if (!isAdmin && record.userId !== userId) {
      throw new AppError('You can only delete your own records', 403);
    }

    // Soft delete
    await prisma.record.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Record deleted successfully' };
  }
}
