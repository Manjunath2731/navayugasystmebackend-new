import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireOwner } from '../middleware/rbacMiddleware';
import { validate, validateParams } from '../middleware/validationMiddleware';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validation/userValidation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Only owners can access these routes
router.post('/', requireOwner(), validate(createUserSchema), createUser);
router.get('/', requireOwner(), getUsers);
router.get('/:id', requireOwner(), validateParams(userIdSchema), getUserById);
router.put('/:id', requireOwner(), validateParams(userIdSchema), validate(updateUserSchema), updateUser);
router.delete('/:id', requireOwner(), validateParams(userIdSchema), deleteUser);

export default router;