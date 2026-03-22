import { Router } from 'express';
import { stellarController } from '../controllers/stellar.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All Stellar routes require authentication
router.use(authenticate);

// GET /api/stellar/account/:publicKey
router.get('/account/:publicKey', stellarController.getAccount);

// GET /api/stellar/payments/:publicKey
router.get('/payments/:publicKey', stellarController.getPayments);

// POST /api/stellar/transaction/submit
router.post('/transaction/submit', stellarController.submitTransaction);

// POST /api/stellar/transaction/build
router.post('/transaction/build', stellarController.buildPayment);

export default router;
