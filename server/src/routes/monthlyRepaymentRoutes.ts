import express from 'express';
import {
  createMonthlyRepaymentHandler,
  getAllMonthlyRepaymentsHandler,
  getMonthlyRepaymentByIdHandler,
  updateMonthlyRepaymentHandler,
  deleteMonthlyRepaymentHandler,
} from '../controllers/monthlyRepaymentController';
import { authenticate } from '../middleware/auth';
import { requireAnyRole } from '../middleware/rbacMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all monthly repayments
router.get('/', getAllMonthlyRepaymentsHandler);

// Create monthly repayment (field_officer only)
router.post('/', requireAnyRole(UserRole.FIELD_OFFICER), createMonthlyRepaymentHandler);

// Get monthly repayment by ID
router.get('/:id', getMonthlyRepaymentByIdHandler);

// Update monthly repayment (field_officer only)
router.put('/:id', requireAnyRole(UserRole.FIELD_OFFICER), updateMonthlyRepaymentHandler);

// Delete monthly repayment (field_officer only)
router.delete('/:id', requireAnyRole(UserRole.FIELD_OFFICER), deleteMonthlyRepaymentHandler);

export default router;

