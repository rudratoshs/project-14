import { Request, Response } from 'express';
import { UserSubscriptionService } from '../../services/subscription/user-subscription.service.js';

export class UserSubscriptionController {
  private subscriptionService: UserSubscriptionService;

  constructor() {
    this.subscriptionService = new UserSubscriptionService();
  }

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
}

export default new UserSubscriptionController();