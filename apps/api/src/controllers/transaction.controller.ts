import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as txService from '../services/transaction.service';

export function list(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const data = txService.listTransactions(limit, offset);
    // total reflects the full store count, not the page size
    const total = txService.countTransactions();
    res.json({ data, limit, offset, total });
  } catch (err) {
    next(err);
  }
}

export function getOne(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const tx = txService.getTransaction(req.params.id);
    res.json(tx);
  } catch (err) {
    next(err);
  }
}

export function create(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const tx = txService.createTransaction({
      from: req.body.from,
      to: req.body.to,
      amount: req.body.amount,
      userId: req.user!.id,
    });
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
}
