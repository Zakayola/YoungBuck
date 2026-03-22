import { Router } from 'express';
import { stats } from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/stats
router.get('/', authenticate, stats);

export default router;
