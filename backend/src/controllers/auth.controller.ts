import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/generateTokens';
import { sendWelcomeEmail } from '../services/email.service';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'jobseeker' | 'recruiter' | 'admin';
    email: string;
  };
}

// ── Register ───────────────────────────────────────────────
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ success: false, message: 'Email already registered' });
    return;
  }

  const user = await User.create({ name, email, password, role });

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({ id: user._id.toString() });

  user.refreshToken = refreshToken;
  await user.save();
  sendWelcomeEmail(user.email, user.name, user.role);
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

// ── Login ──────────────────────────────────────────────────
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({ id: user._id.toString() });

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
    },
  });
};

// ── Refresh Token ──────────────────────────────────────────
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });
    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ success: true, accessToken: newAccessToken });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// ── Logout ─────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  clearRefreshTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
};

// ── Get Me ─────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id).populate('company');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, user });
};