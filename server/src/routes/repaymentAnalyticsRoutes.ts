import express from 'express';
import { getRepaymentAnalyticsHandler } from '../controllers/repaymentAnalyticsController';
import { authenticate } from '../middleware/auth';
import { requireAnyRole } from '../middleware/rbacMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get repayment analytics (owner and front_desk only)
router.get('/', requireAnyRole(UserRole.OWNER, UserRole.FRONT_DESK), getRepaymentAnalyticsHandler);

export default router;

