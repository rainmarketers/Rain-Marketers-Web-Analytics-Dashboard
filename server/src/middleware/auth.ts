import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      isAuthenticated: boolean;
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = (req.session as any);
  req.isAuthenticated = !!session?.userId;
  req.userId = session?.userId;

  if (req.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const session = (req.session as any);
  req.isAuthenticated = !!session?.userId;
  req.userId = session?.userId;
  next();
}
