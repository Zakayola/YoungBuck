import { Response, NextFunction } from 'express';
import type { User } from '@zakayola/types';
import type { AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/db';

export function me(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const record = db.findUserById(req.user!.id);
    if (!record) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { passwordHash: _, ...safe }: { passwordHash: string } & User = record;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export function updateProfile(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const record = db.findUserById(req.user!.id);
    if (!record) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      record.name = req.body.name.trim();
    }
    if (typeof req.body.walletAddress === 'string') {
      record.walletAddress = req.body.walletAddress;
    }

    const { passwordHash: _, ...safe }: { passwordHash: string } & User = record;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}
