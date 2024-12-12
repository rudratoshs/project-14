import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { Course } from '@prisma/client';

/**
 * Middleware to check if a user has an active subscription and validate their course limits
 */
export async function validateSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    
    // Admin users bypass subscription checks
    if (user?.role.name.toLowerCase() === 'admin') {
      return next();
    }

    // Get user's active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user?.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    // If no subscription, default to free plan
    if (!subscription) {
      const freePlan = await prisma.subscriptionPlan.findFirst({
        where: {
          name: 'Free',
          isActive: true,
        },
      });

      if (!freePlan) {
        return res.status(500).json({ message: 'No free plan available' });
      }

      // Create free subscription for user
      await prisma.userSubscription.create({
        data: {
          userId: user?.id!,
          planId: freePlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
      });

      req.subscription = {
        plan: freePlan,
        isActive: true,
      };
    } else {
      req.subscription = {
        plan: subscription.plan,
        isActive: true,
      };
    }

    next();
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({ message: 'Failed to validate subscription' });
  }
}

/**
 * Middleware to check if user has reached their course limit
 */
export async function validateCourseLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    const subscription = req.subscription;

    // Admin users bypass course limits
    if (user?.role.name.toLowerCase() === 'admin') {
      return next();
    }

    if (!subscription?.plan) {
      return res.status(403).json({ message: 'No active subscription' });
    }

    // Check course limit
    const courseCount = await prisma.course.count({
      where: { userId: user?.id },
    });

    if (subscription.plan.courseLimit > 0 && courseCount >= subscription.plan.courseLimit) {
      return res.status(403).json({ 
        message: 'Course limit reached for your subscription plan' 
      });
    }

    next();
  } catch (error) {
    console.error('Course limit validation error:', error);
    res.status(500).json({ message: 'Failed to validate course limit' });
  }
}

/**
 * Middleware to validate subscription features
 */
export function validateFeatures(features: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const subscription = req.subscription;

      // Admin users bypass feature checks
      if (user?.role.name.toLowerCase() === 'admin') {
        return next();
      }

      if (!subscription?.plan) {
        return res.status(403).json({ message: 'No active subscription' });
      }

      // Check if all required features are included in the plan
      const hasAllFeatures = features.every(feature =>
        subscription.plan.features.includes(feature)
      );

      if (!hasAllFeatures) {
        return res.status(403).json({ 
          message: 'Your subscription plan does not include all required features' 
        });
      }

      next();
    } catch (error) {
      console.error('Feature validation error:', error);
      res.status(500).json({ message: 'Failed to validate features' });
    }
  };
}