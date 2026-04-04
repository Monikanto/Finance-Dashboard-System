import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendSuccess } from '../../utils/apiResponse';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static getSummary = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const userId = isAdmin ? undefined : req.user!.id;
    const summary = await DashboardService.getSummary(userId);

    sendSuccess(res, 200, {
      message: 'Dashboard summary retrieved',
      data: summary,
    });
  });

  static getCategoryTotals = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const userId = isAdmin ? undefined : req.user!.id;
    const totals = await DashboardService.getCategoryTotals(userId);

    sendSuccess(res, 200, {
      message: 'Category totals retrieved',
      data: totals,
    });
  });

  static getRecentTransactions = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const userId = isAdmin ? undefined : req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await DashboardService.getRecentTransactions(userId, limit);

    sendSuccess(res, 200, {
      message: 'Recent transactions retrieved',
      data: transactions,
    });
  });

  static getMonthlyTrends = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === 'ADMIN';
    const userId = isAdmin ? undefined : req.user!.id;
    const months = parseInt(req.query.months as string) || 12;
    const trends = await DashboardService.getMonthlyTrends(userId, months);

    sendSuccess(res, 200, {
      message: 'Monthly trends retrieved',
      data: trends,
    });
  });
}
