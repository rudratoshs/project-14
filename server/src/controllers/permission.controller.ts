import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service.js';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  /**
   * Fetches all permissions.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getPermissions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = await this.permissionService.findAll();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch permissions',
      });
    }
  }

  /**
   * Fetches a specific permission by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getPermissionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const permission = await this.permissionService.findById(id);

      if (!permission) {
        res.status(404).json({ message: 'Permission not found' });
        return;
      }

      res.json(permission);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch permission',
      });
    }
  }
}

export default new PermissionController();