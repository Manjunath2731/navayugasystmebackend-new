import express from 'express';
import {
  createSHGHandler,
  getAllSHGsHandler,
  getSHGByIdHandler,
  updateSHGHandler,
  deleteSHGHandler,
} from '../controllers/shgController';
import { authenticate } from '../middleware/auth';
import { requireOwner, requireAnyRole } from '../middleware/rbacMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all SHGs
router.get('/', getAllSHGsHandler);

// Create SHG (owner and front_desk)
router.post('/', requireAnyRole(UserRole.OWNER, UserRole.FRONT_DESK), createSHGHandler);

// Get SHG by ID
router.get('/:id', getSHGByIdHandler);

// Update SHG (owner and front_desk)
router.put('/:id', requireAnyRole(UserRole.OWNER, UserRole.FRONT_DESK), updateSHGHandler);

// Delete SHG (owner only, front_desk must use delete ticket)
router.delete('/:id', requireOwner(), deleteSHGHandler);

export default router;

