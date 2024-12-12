export interface CreateSubscriptionPlanData {
    name: string;
    description?: string;
    price: number;
    interval: 'MONTHLY' | 'YEARLY';
    features: string[];
    courseLimit: number;
    isActive?: boolean;
  }
  
  export interface UpdateSubscriptionPlanData {
    name?: string;
    description?: string;
    price?: number;
    interval?: 'MONTHLY' | 'YEARLY';
    features?: string[];
    courseLimit?: number;
    isActive?: boolean;
  }
  
  export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    interval: 'MONTHLY' | 'YEARLY';
    features: string[];
    courseLimit: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    plan: SubscriptionPlan;
  }