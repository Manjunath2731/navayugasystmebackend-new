import multer from 'multer';
import { Request } from 'express';

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory for S3 upload

// File filter to allow only specific file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common image and document types
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp' ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'text/plain' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, PDF, and DOC files are allowed.'));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple file upload
export const uploadMultiple = upload.array('files', 5); // Max 5 files

// Middleware for file fields
export const uploadFields = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]);