import { User } from '@prisma/client';
import { SubscriptionPlan } from './subscription';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        role: {
          permissions: {
            permission: {
              name: string;
            };
          }[];
        };
      };
      subscription?: {
        plan: SubscriptionPlan;
        isActive: boolean;
      };
    }
  }
}

export {};