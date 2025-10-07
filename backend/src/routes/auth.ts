import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, refresh } from '../controllers/authController';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);

export default router;
