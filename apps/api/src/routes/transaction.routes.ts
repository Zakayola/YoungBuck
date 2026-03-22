import { Router } from 'express';
import { list, getOne, create } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// GET /api/transactions
router.get('/', list);

// GET /api/transactions/:id
router.get('/:id', getOne);

// POST /api/transactions
router.post('/', create);

export default router;
