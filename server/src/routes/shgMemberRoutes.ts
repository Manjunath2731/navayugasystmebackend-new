import express from 'express';
import {
  createSHGMemberHandler,
  getAllSHGMembersHandler,
  getSHGMemberByIdHandler,
  updateSHGMemberHandler,
  deleteSHGMemberHandler,
} from '../controllers/shgMemberController';
import { authenticate } from '../middleware/auth';
import { requireOwner, requireAnyRole } from '../middleware/rbacMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all SHG members (optionally filtered by shgId query param)
router.get('/', getAllSHGMembersHandler);

// Create SHG member (owner and front_desk)
router.post('/', requireAnyRole(UserRole.OWNER, UserRole.FRONT_DESK), createSHGMemberHandler);

// Get SHG member by ID
router.get('/:id', getSHGMemberByIdHandler);

// Update SHG member (owner and front_desk)
router.put('/:id', requireAnyRole(UserRole.OWNER, UserRole.FRONT_DESK), updateSHGMemberHandler);

// Delete SHG member (owner and front_desk can delete directly)
router.delete('/:id', requireAnyRole(UserRole.OWNER, UserRole.FRONT_DESK), deleteSHGMemberHandler);

export default router;

