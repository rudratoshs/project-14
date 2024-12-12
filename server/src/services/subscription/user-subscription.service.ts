import prisma from '../../config/prisma.js';
import { UserSubscription } from '../../types/subscription.js';

export class UserSubscriptionService {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      return await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
      });
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  async subscribeToPlan(userId: string, planId: string): Promise<UserSubscription> {
    // Cancel any existing active subscription
    await prisma.userSubscription.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // Create new subscription
    return await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      include: {
        plan: true,
      },
    });
  }

  async cancelSubscription(userId: string): Promise<void> {
    await prisma.userSubscription.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }
}

export default new UserSubscriptionService();