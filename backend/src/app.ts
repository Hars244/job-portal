import 'express-async-errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes        from './routes/auth.routes';
import jobRoutes         from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import companyRoutes     from './routes/company.routes';
import aiRoutes from './routes/ai.routes';
import userRoutes from './routes/user.routes';

const app: Application = express();

// ── Security & parsing middleware ──────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Job Portal API is running' });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/jobs',         jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/companies',    companyRoutes);
app.use('/api/v1/ai',           aiRoutes);
app.use('/api/v1/users', userRoutes);

// ── 404 handler ────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ───────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;