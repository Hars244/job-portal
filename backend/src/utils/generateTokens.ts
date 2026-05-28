import jwt from 'jsonwebtoken';

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

export const setRefreshTokenCookie = (res: any, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: any): void => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};