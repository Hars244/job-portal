import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['jobseeker', 'recruiter']).default('jobseeker'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/refresh',  refreshToken);
router.post('/logout',   logout);
router.get('/me',        protect, getMe);

export default router;