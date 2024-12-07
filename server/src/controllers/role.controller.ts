import { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';
import { CreateRoleData, UpdateRoleData } from '../types/role.js';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  /**
   * Fetches all roles.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.roleService.findAll();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  }

  /**
   * Fetches a role by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const role = await this.roleService.findById(req.params.id);
      if (!role) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch role' });
    }
  }

  /**
   * Creates a new role.
   * @param req Express Request object
   * @param res Express Response object
   */
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateRoleData = req.body;
      const role = await this.roleService.create(data);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create role',
      });
    }
  }

  /**
   * Updates a role by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateRoleData = req.body;
      const role = await this.roleService.update(req.params.id, data);
      res.json(role);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to update role',
      });
    }
  }

  /**
   * Deletes a role by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      await this.roleService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to delete role',
      });
    }
  }
}

export default new RoleController();