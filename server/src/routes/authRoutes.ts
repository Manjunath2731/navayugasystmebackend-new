import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validation/userValidation';
import { upload } from '../config/multer';

const router = express.Router();

router.post('/register', upload.none(), validate(registerSchema), register);
router.post('/login', upload.none(), validate(loginSchema), login);
router.get('/profile', authenticate, getProfile);

export default router;