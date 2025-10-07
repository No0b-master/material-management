import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { userDashboard, approverDashboard } from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);
router.get('/user/:id', authorize('admin_or_self'), userDashboard);
router.get('/approver/:id', authorize(['hod','pm','store','admin']), approverDashboard);

export default router;
