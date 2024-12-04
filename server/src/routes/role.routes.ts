import { Router } from 'express';
import roleController from '../controllers/role.controller.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

router.get('/',
  requirePermission('manage_roles'),
  (req, res) => roleController.getRoles(req, res)
);

router.get('/:id',
  requirePermission('manage_roles'),
  (req, res) => roleController.getRoleById(req, res)
);

router.post('/',
  requirePermission('manage_roles'),
  (req, res) => roleController.createRole(req, res)
);

router.put('/:id',
  requirePermission('manage_roles'),
  (req, res) => roleController.updateRole(req, res)
);

router.delete('/:id',
  requirePermission('manage_roles'),
  (req, res) => roleController.deleteRole(req, res)
);

export default router;