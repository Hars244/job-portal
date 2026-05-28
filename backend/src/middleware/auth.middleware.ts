import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'jobseeker' | 'recruiter' | 'admin';
    email: string;
  };
}

interface JwtPayload {
  id: string;
  role: 'jobseeker' | 'recruiter' | 'admin';
  email: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};