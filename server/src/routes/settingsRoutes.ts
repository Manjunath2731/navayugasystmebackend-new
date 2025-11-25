import express from 'express';
import {
  updateUserProfile,
  changeUserPassword,
  uploadUserAvatar,
  removeUserAvatar
} from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validationMiddleware';
import { updateProfileSchema, changePasswordSchema } from '../validation/settingsValidation';
import { uploadSingle } from '../config/multer';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Update profile (name and phone)
router.put('/profile', validate(updateProfileSchema), updateUserProfile);

// Change password
router.put('/password', validate(changePasswordSchema), changeUserPassword);

// Upload avatar
router.post('/avatar', uploadSingle, uploadUserAvatar);

// Delete avatar
router.delete('/avatar', removeUserAvatar);

export default router;

