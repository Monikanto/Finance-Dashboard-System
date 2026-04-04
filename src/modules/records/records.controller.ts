import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { RecordsService } from './records.service';

export class RecordsController {
  static create = catchAsync(async (req: Request, res: Response) => {
    const record = await RecordsService.create(req.user!.id, req.body);

    sendSuccess(res, 201, {
      message: 'Record created successfully',
      data: record,
    });
  });

  static getAll = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const result = await RecordsService.getAll(req.user!.id, req.query as any, isAdmin);

    sendSuccess(res, 200, {
      message: 'Records retrieved successfully',
      data: result.records,
      meta: result.pagination,
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const record = await RecordsService.getById(req.params.id, req.user!.id, isAdmin);

    sendSuccess(res, 200, {
      message: 'Record retrieved successfully',
      data: record,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const record = await RecordsService.update(req.params.id, req.user!.id, req.body);

    sendSuccess(res, 200, {
      message: 'Record updated successfully',
      data: record,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const result = await RecordsService.delete(req.params.id, req.user!.id, isAdmin);

    sendSuccess(res, 200, {
      message: result.message,
    });
  });
}
