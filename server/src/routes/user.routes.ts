import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

router.get('/', 
  requirePermission('manage_users'),
  (req, res) => userController.getUsers(req, res)
);

router.get('/:id',
  requirePermission('manage_users'),
  (req, res) => userController.getUserById(req, res)
);

router.post('/',
  requirePermission('manage_users'),
  (req, res) => userController.createUser(req, res)
);

router.put('/:id',
  requirePermission('manage_users'),
  (req, res) => userController.updateUser(req, res)
);

router.delete('/:id',
  requirePermission('manage_users'),
  (req, res) => userController.deleteUser(req, res)
);

export default router;