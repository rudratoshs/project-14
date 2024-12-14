import { Request, Response } from 'express';
import subscriptionPlanService from '../services/subscription/plan.service.js';

class SubscriptionPlanController {
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await subscriptionPlanService.getPlans();
      res.json(plans);
    } catch (error) {
      console.error('Controller Error:', error); // Debug log
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch plans',
      });
    }
  }

  async getPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await subscriptionPlanService.getPlan(req.params.id);
      if (!plan) {
        res.status(404).json({ message: 'Plan not found' });
        return;
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch plan',
      });
    }
  }

  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await subscriptionPlanService.createPlan(req.body);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create plan',
      });
    }
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await subscriptionPlanService.updatePlan(req.params.id, req.body);
      res.json(plan);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to update plan',
      });
    }
  }

  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      await subscriptionPlanService.deletePlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to delete plan',
      });
    }
  }
}

export default new SubscriptionPlanController();