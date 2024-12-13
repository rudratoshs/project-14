import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { CreateUserData, UpdateUserData } from '../types/user.js';

export class UserService {
  async findAll() {
    return prisma.user.findMany({
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async create(data: CreateUserData & { subscriptionPlan?: string; planId?: string }) {
    if (!data.password) {
      throw new Error('Password is required for creating a user');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (data.planId) {
      const subscriptionPlanExists = await prisma.subscriptionPlan.findUnique({
        where: { id: data.planId },
      });

      if (!subscriptionPlanExists) {
        throw new Error('Invalid subscription plan');
      }

      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          planId: data.planId,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      });
    }

    return prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: UpdateUserData & { subscriptionPlan?: string; planId?: string }
  ) {
    console.log('Incoming Data:', data);

    // Validate email if provided
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const updateData: any = { ...data };

    // Hash password if provided
    if (data.password) {
      if (typeof data.password !== 'string') {
        throw new Error('Password must be a string');
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Handle role updates
    if (data.roleId) {
      updateData.role = {
        connect: { id: data.roleId },
      };
      delete updateData.roleId;
    }

    if (data.planId) {
      // Check if subscription plan exists
      const subscriptionPlanExists = await prisma.subscriptionPlan.findUnique({
        where: { id: data.planId },
      });

      console.log('subscriptionPlanExists', subscriptionPlanExists, 'data.planId', data.planId)
      if (!subscriptionPlanExists) {
        throw new Error('Invalid subscription plan');
      }

      // Cancel any existing active subscriptions
      await prisma.userSubscription.updateMany({
        where: { userId: id, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      // Create a new active subscription
      const newSubscription = await prisma.userSubscription.create({
        data: {
          userId: id,
          planId: data.planId,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      });

      console.log('Created Subscription:', newSubscription);
      delete updateData.planId;
      delete updateData.subscriptionPlan;
    }

    // Fetch active subscription to return accurate data
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: { userId: id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }, // Ensure the latest subscription is fetched
      include: { plan: true },
    });
    console.log('Active subscription:', activeSubscription);

    // Remove any invalid fields from updateData
    delete updateData.subscriptionPlan; // Ensure this is removed before update

    // Update user fields
    console.log('Updating user with data:', updateData);
    return prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export default new UserService();