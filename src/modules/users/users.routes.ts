import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { updateUserSchema, getUsersQuerySchema } from './users.schema';

const router = Router();

// All user management routes require Admin role
router.use(authenticate, authorize('ADMIN'));

router.get('/', validate(getUsersQuerySchema, 'query'), UsersController.getAll);
router.get('/:id', UsersController.getById);
router.patch('/:id', validate(updateUserSchema), UsersController.update);
router.delete('/:id', UsersController.delete);

export default router;
