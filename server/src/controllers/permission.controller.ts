import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service.js';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async getPermissions(req: Request, res: Response) {
    try {
      const permissions = await this.permissionService.findAll();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch permissions' });
    }
  }

  async getPermissionById(req: Request, res: Response) {
    try {
      const permission = await this.permissionService.findById(req.params.id);
      if (!permission) {
        return res.status(404).json({ message: 'Permission not found' });
      }
      res.json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch permission' });
    }
  }
}

export default new PermissionController();