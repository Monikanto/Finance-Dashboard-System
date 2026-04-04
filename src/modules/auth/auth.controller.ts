import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { AuthService } from './auth.service';

export class AuthController {
  static signup = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.signup(req.body);

    sendSuccess(res, 201, {
      message: 'User registered successfully',
      data: result,
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    sendSuccess(res, 200, {
      message: 'Login successful',
      data: result,
    });
  });
}
