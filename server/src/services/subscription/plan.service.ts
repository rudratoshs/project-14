import prisma from '../../config/prisma.js';
import { SubscriptionPlan, CreateSubscriptionPlanData, UpdateSubscriptionPlanData } from '../../types/subscription.js';

class SubscriptionPlanService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('Service: Fetching subscription plans...'); // Debug log
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { price: 'asc' },
      });
      console.log('Service: Found plans:', plans); // Debug log
      return plans;
    } catch (error) {
      console.error('Service Error:', error); // Debug log
      throw error;
    }
  }

  async getPlan(id: string): Promise<SubscriptionPlan | null> {
    return await prisma.subscriptionPlan.findUnique({
      where: { id },
    });
  }

  async createPlan(data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: data.name },
    });

    if (existingPlan) {
      throw new Error('Plan name already exists');
    }

    return await prisma.subscriptionPlan.create({
      data: {
        ...data,
        features: data.features as any,
      },
    });
  }

  async updatePlan(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlan> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (plan.name.toLowerCase() === 'free') {
      const { name, price, interval, ...allowedUpdates } = data;
      return await prisma.subscriptionPlan.update({
        where: { id },
        data: allowedUpdates,
      });
    }

    return await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...data,
        features: data.features as any,
      },
    });
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    if (plan.name.toLowerCase() === 'free') {
      throw new Error('Cannot delete the free plan');
    }

    await prisma.subscriptionPlan.delete({
      where: { id },
    });
  }
}

export default new SubscriptionPlanService();