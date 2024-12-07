import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginCredentials, RegisterData } from '../types/auth.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handles user login.
   * @param req Express Request object
   * @param res Express Response object
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      const result = await this.authService.login(credentials);
      res.json(result);
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }

  /**
   * Handles user registration.
   * @param req Express Request object
   * @param res Express Response object
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterData = req.body;
      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }
}

export default new AuthController();