import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateAccessToken = (payload: {
  id: string;
  role: string;
  email: string;
}): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: {
  id: string;
}): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  } as jwt.SignOptions);
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction, // Forces HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' allows Vercel -> Render cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction, // Must match the settings used during creation
    sameSite: isProduction ? 'none' : 'lax', // Must match the settings used during creation
  });
};