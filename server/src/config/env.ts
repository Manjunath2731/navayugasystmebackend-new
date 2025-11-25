import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongo: {
    host: process.env.MONGO_HOST || 'localhost',
    port: parseInt(process.env.MONGO_PORT || '27017', 10),
    username: process.env.MONGO_ROOT_USERNAME || 'admin',
    password: process.env.MONGO_ROOT_PASSWORD || 'admin123',
    database: process.env.MONGO_DATABASE || 'navayuga',
    // For backward compatibility, also support MONGO_URI if provided
    uri: process.env.MONGO_URI
  },
  mongoUri: process.env.MONGO_URI || '', // Will be constructed from individual components if not provided
  jwtSecret: process.env.JWT_SECRET || 'navayuga_jwt_secret_key',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME || 'navayuga-files'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    },
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@navayuga.com'
  },
  app: {
    name: process.env.APP_NAME || 'Navayuga',
    url: process.env.APP_URL || 'http://localhost:5173'
  }
};