import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Extend Express Request interface to store authenticated user details
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'ADMIN' | 'SALES_USER';
  };
}

// 2. Middleware to verify JWT token from Authorization header
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  // Header format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as AuthRequest['user'];
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// 3. Middleware to restrict access based on user roles (RBAC)
export const requireRole = (roles: ('ADMIN' | 'SALES_USER')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions to access this resource' 
      });
    }
    next();
  };
};