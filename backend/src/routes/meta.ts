import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listCostCenters, metaDropdowns } from '../controllers/metaController';

const router = Router();

router.use(authenticate);
router.get('/cost-centers', listCostCenters);
router.get('/dropdowns', metaDropdowns);

export default router;
