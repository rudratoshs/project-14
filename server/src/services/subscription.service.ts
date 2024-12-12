import prisma from '../config/prisma.js';
import { CreateSubscriptionPlanData, UpdateSubscriptionPlanData } from '../types/subscription.js';

export class SubscriptionService {
  /**
   * Get all subscription plans
   */
  async getPlans() {
    return prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Get a specific subscription plan
   */
  async getPlan(id: string) {
    return prisma.subscriptionPlan.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(data: CreateSubscriptionPlanData) {
    // Check if plan name already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: data.name },
    });

    if (existingPlan) {
      throw new Error('Plan name already exists');
    }

    return prisma.subscriptionPlan.create({
      data: {
        ...data,
        features: data.features as any,
      },
    });
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(id: string, data: UpdateSubscriptionPlanData) {
    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Prevent modifying the free plan's core attributes
    if (plan.name.toLowerCase() === 'free') {
      const { name, price, interval, ...allowedUpdates } = data;
      return prisma.subscriptionPlan.update({
        where: { id },
        data: allowedUpdates,
      });
    }

    return prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...data,
        features: data.features as any,
      },
    });
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (plan.name.toLowerCase() === 'free') {
      throw new Error('Cannot delete the free plan');
    }

    // Cancel all active subscriptions to this plan
    await prisma.userSubscription.updateMany({
      where: {
        planId: id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string) {
    return prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });
  }

  /**
   * Subscribe user to a plan
   */
  async subscribeToPlan(userId: string, planId: string) {
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
    return prisma.userSubscription.create({
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

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(userId: string) {
    return prisma.userSubscription.updateMany({
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

export default new SubscriptionService();