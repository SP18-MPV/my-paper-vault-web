import { AppError } from '@/errors/AppError';
import { apiClient } from '../client';
import type { components } from '../types';

export type SubscriptionPlan = components['schemas']['GetPlansResponse']['data'][number];

export type GetMySubscriptionResponse = components['schemas']['GetMySubscriptionResponse'];
export type MySubscription = GetMySubscriptionResponse['data']['subscription'];
export type MyStorage = GetMySubscriptionResponse['data']['storage'];
export type SubscriptionStatus = MySubscription['status'];
export type StorageThreshold = MyStorage['threshold'];

export type SubscriptionData = {
  subscription: MySubscription;
  storage: MyStorage;
  free_plan_used: boolean;
};

// The free plan: priced 0 for both billing cycles. Every user gets it once.
export const isFreePlan = (plan: { monthly_price: number; yearly_price: number }) =>
  plan.monthly_price === 0 && plan.yearly_price === 0;

/** Parse a BigInt-serialised byte string (e.g. "10737418240") to a JS number. */
export const parseBytes = (value: string): number => parseInt(value, 10);

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data } = await apiClient.GET('/subscriptions/plans', {});
  return data!.data;
};

export const subscribeToPlan = async (
  planId: string,
  billingCycle: 'MONTHLY' | 'YEARLY',
): Promise<void> => {
  await apiClient.POST('/subscriptions', {
    body: { plan_id: planId, billing_cycle: billingCycle },
  });
};

export const startTrial = async (planId: string): Promise<void> => {
  await apiClient.POST('/subscriptions/trial', {
    body: { plan_id: planId },
  });
};

export const cancelSubscription = async (): Promise<void> => {
  await apiClient.DELETE('/subscriptions/me', {});
};

export const getMySubscription = async (): Promise<SubscriptionData | null> => {
  try {
    const { data } = await apiClient.GET('/subscriptions/me', {});
    return data!.data;
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};
