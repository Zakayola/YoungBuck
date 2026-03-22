import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDashboardStats } from '../services/stats.service';

export function stats(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    res.json(getDashboardStats());
  } catch (err) {
    next(err);
  }
}
