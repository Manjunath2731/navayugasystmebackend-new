import express from 'express';
import {
  createDeleteTicketHandler,
  getAllDeleteTicketsHandler,
  getDeleteTicketByIdHandler,
  updateDeleteTicketHandler,
} from '../controllers/deleteTicketController';
import { authenticate } from '../middleware/auth';
import { requireOwner, requireFrontDesk } from '../middleware/rbacMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all delete tickets
router.get('/', getAllDeleteTicketsHandler);

// Create delete ticket (front_desk only)
router.post('/', requireFrontDesk(), createDeleteTicketHandler);

// Get delete ticket by ID
router.get('/:id', getDeleteTicketByIdHandler);

// Update delete ticket (approve/reject) - owner only
router.put('/:id', requireOwner(), updateDeleteTicketHandler);

export default router;

