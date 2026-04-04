import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Summary — accessible by all roles
router.get(
  '/summary',
  authorize('ADMIN', 'ANALYST', 'VIEWER'),
  DashboardController.getSummary
);

// Category totals — Analyst and Admin only
router.get(
  '/category-totals',
  authorize('ADMIN', 'ANALYST'),
  DashboardController.getCategoryTotals
);

// Recent transactions — Analyst and Admin only
router.get(
  '/recent',
  authorize('ADMIN', 'ANALYST'),
  DashboardController.getRecentTransactions
);

// Monthly trends — Analyst and Admin only
router.get(
  '/trends',
  authorize('ADMIN', 'ANALYST'),
  DashboardController.getMonthlyTrends
);

export default router;
