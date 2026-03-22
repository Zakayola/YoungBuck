import { Router } from 'express';
import { me, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// GET /api/users/me
router.get('/me', me);

// PATCH /api/users/me
router.patch('/me', updateProfile);

export default router;
