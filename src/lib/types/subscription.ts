export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    interval: 'MONTHLY' | 'YEARLY';
    features: string[];
    courseLimit: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    plan: SubscriptionPlan;
  }
  
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