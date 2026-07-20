import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import mailRoutes from './routes/mailRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import idCardRoutes from './routes/idCardRoutes.js';
import franchiseRoutes from './routes/franchiseRoutes.js';
import subAdminRoutes from './routes/subAdminRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';

dotenv.config();

const app = express();

// Clean the frontend URL by removing any accidental trailing slashes from the .env file
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const cleanFrontendUrl = rawFrontendUrl.replace(/\/$/, '');

app.use(
  cors({
    origin: [
      cleanFrontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ],
    credentials: true
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'BIIT Coaching Admin'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/sub-admins', subAdminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/id-cards', idCardRoutes);
app.use('/api/website', websiteRoutes);

app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_RETRY = 5;

const startServer = (port, retryCount = 0) => {
  const server = app.listen(port, () => {
    console.log(`BIIT backend running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && retryCount < MAX_PORT_RETRY) {
      const nextPort = port + 1;
      startServer(nextPort, retryCount + 1);
      return;
    }
    console.error('Server failed to start:', error.message);
    process.exit(1);
  });
};

connectDB()
  .then(() => {
    startServer(DEFAULT_PORT);
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });