import { Request, Response } from 'express';
import { PermissionService } from '../services/permission.service.js';

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  /**
   * Fetches all permissions.
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

  /**
   * Creates a new permission.
   */
  async createPermission(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        res.status(400).json({ message: 'Name and description are required' });
        return;
      }

      const permission = await this.permissionService.create({ name, description });
      res.status(201).json(permission);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to create permission',
      });
    }
  }

  /**
   * Updates an existing permission by ID.
   */
  async updatePermission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const updatedPermission = await this.permissionService.update(id, { name, description });

      if (!updatedPermission) {
        res.status(404).json({ message: 'Permission not found' });
        return;
      }

      res.json(updatedPermission);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to update permission',
      });
    }
  }
}

export default new PermissionController();