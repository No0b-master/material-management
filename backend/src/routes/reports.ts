import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { detailedReport, summaryReport } from '../controllers/reportsController';

const router = Router();

router.use(authenticate);
router.get('/detailed', authorize(['store','admin']), detailedReport);
router.get('/summary', authorize(['store','admin']), summaryReport);

export default router;
