import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { actOnApproval, getApprovalHistory } from '../controllers/approvalsController';

const router = Router();

router.use(authenticate);
router.post('/:requestId', authorize(['hod','pm','store']), actOnApproval);
router.get('/:requestId', authorize(['requester','hod','pm','store','admin']), getApprovalHistory);

export default router;
