import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { stellarService } from '../services/stellar.service';

export const stellarController = {
  getAccount: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { publicKey } = req.params;
      if (!publicKey) {
        res.status(400).json({ error: 'publicKey is required' });
        return;
      }
      const account = await stellarService.getAccount(publicKey);
      res.json({ account });
    } catch (err) {
      next(err);
    }
  },

  getPayments: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { publicKey } = req.params;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const payments = await stellarService.getPayments(publicKey, limit);
      res.json({ payments });
    } catch (err) {
      next(err);
    }
  },

  submitTransaction: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { xdr } = req.body as { xdr: string };
      if (!xdr) {
        res.status(400).json({ error: 'xdr is required' });
        return;
      }
      const result = await stellarService.submitTransaction(xdr);
      res.json({ result });
    } catch (err) {
      next(err);
    }
  },

  buildPayment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { sourcePublicKey, destinationPublicKey, amount, memo } =
        req.body as {
          sourcePublicKey: string;
          destinationPublicKey: string;
          amount: string;
          memo?: string;
        };

      if (!sourcePublicKey || !destinationPublicKey || !amount) {
        res.status(400).json({
          error: 'sourcePublicKey, destinationPublicKey, and amount are required',
        });
        return;
      }

      const xdr = await stellarService.buildPaymentXdr(
        sourcePublicKey,
        destinationPublicKey,
        amount,
        memo
      );
      res.json({ xdr });
    } catch (err) {
      next(err);
    }
  },
};
