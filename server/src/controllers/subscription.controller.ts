import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';
import { CreateSubscriptionPlanData, UpdateSubscriptionPlanData } from '../types/subscription.js';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Get all subscription plans
   */
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await this.subscriptionService.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch plans',
      });
    }
  }

  /**
   * Get a specific subscription plan
   */
  async getPlan(req: Request, res: Response): Promise<void> {
    try {
      const plan = await this.subscriptionService.getPlan(req.params.id);
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

  /**
   * Create a new subscription plan
   */
  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateSubscriptionPlanData = req.body;
      const plan = await this.subscriptionService.createPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to create plan',
      });
    }
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(req: Request, res: Response): Promise<void> {
    try {
      const data: UpdateSubscriptionPlanData = req.body;
      const plan = await this.subscriptionService.updatePlan(req.params.id, data);
      if (!plan) {
        res.status(404).json({ message: 'Plan not found' });
        return;
      }
      res.json(plan);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to update plan',
      });
    }
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(req: Request, res: Response): Promise<void> {
    try {
      await this.subscriptionService.deletePlan(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to delete plan',
      });
    }
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscription = await this.subscriptionService.getUserSubscription(req.params.userId);
      if (!subscription) {
        res.status(404).json({ message: 'Subscription not found' });
        return;
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to fetch subscription',
      });
    }
  }

  /**
   * Subscribe user to a plan
   */
  async subscribeToPlan(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { planId } = req.body;
      const subscription = await this.subscriptionService.subscribeToPlan(userId, planId);
      res.json(subscription);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to subscribe to plan',
      });
    }
  }

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      await this.subscriptionService.cancelSubscription(userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to cancel subscription',
      });
    }
  }

  /**
   * Get user's Current Course Count
   */
  async getUserCourseCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const count = await this.subscriptionService.getUserCourseCount(userId);
      res.status(200).json({ courseCount: count });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Failed to get user course count',
      });
    }
  }
}

export default new SubscriptionController();