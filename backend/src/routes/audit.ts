import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { auditTrail } from '../controllers/auditController';

const router = Router();

router.use(authenticate);
router.get('/:requestId', authorize(['requester','hod','pm','store','admin']), auditTrail);

export default router;
