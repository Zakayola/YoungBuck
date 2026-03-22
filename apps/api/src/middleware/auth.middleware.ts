import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { db } from '../config/db';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token);
    const user = db.findUserById(payload.userId);

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
