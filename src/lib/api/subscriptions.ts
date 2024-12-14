import axios from 'axios';
import {
    SubscriptionPlan,
    CreateSubscriptionPlanData,
    UpdateSubscriptionPlanData,
    UserSubscription
} from '../types/subscription';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

axios.defaults.baseURL = API_URL;

// Add JWT token to requests if available
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
    try {
        const response = await axios.get('/subscriptions/plans');
        return response.data;
    } catch (error) {
        console.error('Error getting subscriptions:', error);
        throw error;
    }
};

export const getSubscriptionPlan = async (id: string): Promise<SubscriptionPlan> => {
    const response = await axios.get(`/subscriptions/plans/${id}`);
    return response.data;
};

export const createSubscriptionPlan = async (data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> => {
    const response = await axios.post('/subscriptions/plans', data);
    return response.data;
};

export const updateSubscriptionPlan = async (
    id: string,
    data: UpdateSubscriptionPlanData
): Promise<SubscriptionPlan> => {
    const response = await axios.put(`/subscriptions/plans/${id}`, data);
    return response.data;
};

export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
    await axios.delete(`/subscriptions/plans/${id}`);
};

export const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
    try {
        const response = await axios.get(`/subscriptions/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting the subscription:', error);
        throw error;
    }
};

export const subscribeUser = async (
    userId: string,
    planId: string
): Promise<UserSubscription> => {
    const response = await axios.post(`/subscriptions/users/${userId}/subscribe`, { planId });
    return response.data;
};

export const cancelSubscription = async (userId: string): Promise<void> => {
    await axios.post(`/subscriptions/users/${userId}/cancel`);
};

export const getUserCourseCount = async (userId: string): Promise<number> => {
    const response = await axios.get(`/subscriptions/users/courseCount/${userId}`);
    return response.data.courseCount;
};