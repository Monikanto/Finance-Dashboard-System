import { Router } from 'express';
import { RecordsController } from './records.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createRecordSchema,
  updateRecordSchema,
  getRecordsQuerySchema,
} from './records.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read endpoints — accessible by all roles
router.get(
  '/',
  authorize('ADMIN', 'ANALYST', 'VIEWER'),
  validate(getRecordsQuerySchema, 'query'),
  RecordsController.getAll
);

router.get(
  '/:id',
  authorize('ADMIN', 'ANALYST', 'VIEWER'),
  RecordsController.getById
);

// Write endpoints — Admin only
router.post(
  '/',
  authorize('ADMIN'),
  validate(createRecordSchema),
  RecordsController.create
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(updateRecordSchema),
  RecordsController.update
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  RecordsController.delete
);

export default router;
