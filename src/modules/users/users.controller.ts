import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { UsersService } from './users.service';

export class UsersController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const result = await UsersService.getAll(req.query as any);

    sendSuccess(res, 200, {
      message: 'Users retrieved successfully',
      data: result.users,
      meta: result.pagination,
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const user = await UsersService.getById(req.params.id);

    sendSuccess(res, 200, {
      message: 'User retrieved successfully',
      data: user,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const user = await UsersService.update(req.params.id, req.body);

    sendSuccess(res, 200, {
      message: 'User updated successfully',
      data: user,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const result = await UsersService.delete(req.params.id);

    sendSuccess(res, 200, {
      message: result.message,
    });
  });
}
