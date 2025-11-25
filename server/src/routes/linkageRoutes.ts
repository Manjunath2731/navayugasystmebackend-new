import express from 'express';
import {
  createLinkageHandler,
  getAllLinkagesHandler,
  getLinkageByIdHandler,
  updateLinkageHandler,
  deleteLinkageHandler,
} from '../controllers/linkageController';
import { authenticate } from '../middleware/auth';
import { requireOwner, requireAnyRole } from '../middleware/rbacMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all linkages (available to all authenticated users for dropdown)
router.get('/', getAllLinkagesHandler);

// Create linkage (owner only)
router.post('/', requireOwner(), createLinkageHandler);

// Get linkage by ID (owner only)
router.get('/:id', requireOwner(), getLinkageByIdHandler);

// Update linkage (owner only)
router.put('/:id', requireOwner(), updateLinkageHandler);

// Delete linkage (owner only)
router.delete('/:id', requireOwner(), deleteLinkageHandler);

export default router;

