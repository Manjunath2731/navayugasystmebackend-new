import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { connectDatabase } from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import fileRoutes from './routes/fileRoutes';
import settingsRoutes from './routes/settingsRoutes';
import linkageRoutes from './routes/linkageRoutes';
import shgRoutes from './routes/shgRoutes';
import shgMemberRoutes from './routes/shgMemberRoutes';
import deleteTicketRoutes from './routes/deleteTicketRoutes';
import monthlyRepaymentRoutes from './routes/monthlyRepaymentRoutes';
import repaymentAnalyticsRoutes from './routes/repaymentAnalyticsRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/linkages', linkageRoutes);
app.use('/api/shgs', shgRoutes);
app.use('/api/shg-members', shgMemberRoutes);
app.use('/api/delete-tickets', deleteTicketRoutes);
app.use('/api/monthly-repayments', monthlyRepaymentRoutes);
app.use('/api/repayment-analytics', repaymentAnalyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Navayuga Backend API' });
});

// Test endpoint for file uploads
app.get('/test-upload', (req, res) => {
  res.json({ 
    message: 'File upload service is ready',
    endpoints: {
      single: '/api/files/upload',
      multiple: '/api/files/upload/multiple',
      delete: '/api/files/delete/:key',
      url: '/api/files/url/:key'
    }
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Connect to MongoDB
connectDatabase();

export default app;