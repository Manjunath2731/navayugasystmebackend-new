import express from 'express';
import { 
  uploadSingleFile, 
  uploadMultipleFiles, 
  deleteFile, 
  getFileUrl 
} from '../controllers/fileController';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../config/multer';
import { validateParams } from '../middleware/validationMiddleware';
import { fileKeySchema } from '../validation/fileValidation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// File upload routes
router.post('/upload', uploadSingle, uploadSingleFile);
router.post('/upload/multiple', uploadMultiple, uploadMultipleFiles);
router.delete('/delete/:key', validateParams(fileKeySchema), deleteFile);
router.get('/url/:key', validateParams(fileKeySchema), getFileUrl);

export default router;