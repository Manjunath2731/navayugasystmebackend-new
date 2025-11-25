import { z } from 'zod';

// Schema for file key validation
export const fileKeySchema = z.object({
  key: z.string().min(1, { message: 'File key is required' })
});

// Schema for file upload validation
export const fileUploadSchema = z.object({
  originalName: z.string().min(1, { message: 'Original file name is required' }),
  mimetype: z.string().min(1, { message: 'File type is required' }),
  size: z.number().positive({ message: 'File size must be positive' })
});

// Schema for multiple file upload validation
export const multipleFileUploadSchema = z.object({
  files: z.array(fileUploadSchema).min(1, { message: 'At least one file is required' })
});

// Type inference
export type FileKeyInput = z.infer<typeof fileKeySchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type MultipleFileUploadInput = z.infer<typeof multipleFileUploadSchema>;