import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { CreateUserData, UpdateUserData } from '../types/user.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Fetches all users.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  /**
   * Fetches a user by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }

  /**
   * Creates a new user.
   * @param req Express Request object
   * @param res Express Response object
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserData = req.body;
      const user = await this.userService.create(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  }

  /**
   * Updates a user by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateUserData = req.body;
      const user = await this.userService.update(req.params.id, data);
      res.json(user);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }

  /**
   * Deletes a user by ID.
   * @param req Express Request object
   * @param res Express Response object
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await this.userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }
}

export default new UserController();