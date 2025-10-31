import { Router } from 'express';
import * as UsersController from '../controllers/users';
import { validateUser } from '../middleware';

const router = Router();

router.post('/', validateUser, UsersController.createUser);
router.get('/', UsersController.getUsers);
router.get('/ranking', UsersController.getRanking);
router.get('/:id', UsersController.getUserById);

export default router;