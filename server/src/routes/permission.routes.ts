import { Router } from 'express';
import permissionController from '../controllers/permission.controller.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

router.get('/',
  requirePermission('manage_roles'),
  (req, res) => permissionController.getPermissions(req, res)
);

router.get('/:id',
  requirePermission('manage_roles'),
  (req, res) => permissionController.getPermissionById(req, res)
);

export default router;