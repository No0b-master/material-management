import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listUsers, createUser, updateUser, deleteUser, getUser } from '../controllers/usersController';

const router = Router();

router.use(authenticate);
router.get('/', authorize(['admin']), listUsers);
router.post('/', authorize(['admin']), createUser);
router.get('/:id', authorize('admin_or_self'), getUser);
router.put('/:id', authorize('admin_or_self'), updateUser);
router.delete('/:id', authorize(['admin']), deleteUser);

export default router;
