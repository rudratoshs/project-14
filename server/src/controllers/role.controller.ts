import { Request, Response } from 'express';
import { RoleService } from '../services/role.service.js';
import { CreateRoleData, UpdateRoleData } from '../types/role.js';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  async getRoles(req: Request, res: Response) {
    try {
      const roles = await this.roleService.findAll();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  }

  async getRoleById(req: Request, res: Response) {
    try {
      const role = await this.roleService.findById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch role' });
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const data: CreateRoleData = req.body;
      const role = await this.roleService.create(data);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create role' 
      });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const data: UpdateRoleData = req.body;
      const role = await this.roleService.update(req.params.id, data);
      res.json(role);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update role' 
      });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      await this.roleService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to delete role' 
      });
    }
  }
}

export default new RoleController();