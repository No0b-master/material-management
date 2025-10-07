import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createRequest, listRequests, getRequestById, updateRequest, deleteRequest } from '../controllers/requestsController';

const router = Router();

router.use(authenticate);
router.post('/', authorize(['requester','admin']), createRequest);
router.get('/', authorize(['requester','hod','pm','store','admin']), listRequests);
router.get('/:id', authorize(['requester','hod','pm','store','admin']), getRequestById);
router.put('/:id', authorize(['requester','admin']), updateRequest);
router.delete('/:id', authorize(['requester','admin']), deleteRequest);

export default router;
