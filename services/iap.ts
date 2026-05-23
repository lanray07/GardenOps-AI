import { ProductSubscription } from 'expo-iap';

import {
  MONTHLY_PRICE,
  PREMIUM_MONTHLY_PRODUCT_ID,
  PREMIUM_YEARLY_PRODUCT_ID,
  YEARLY_PRICE,
} from '../monetisation';

export type PremiumPlanKey = 'monthly' | 'yearly';

export type PurchaseStatus =
  | 'idle'
  | 'loading'
  | 'purchasing'
  | 'restoring'
  | 'unavailable'
  | 'error';

export interface PremiumPlanOption {
  key: PremiumPlanKey;
  productId: string;
  title: string;
  periodLabel: string;
  valueLabel: string;
  fallbackPrice: string;
  storePrice: string;
}

const fallbackPlans: PremiumPlanOption[] = [
  {
    key: 'monthly',
    productId: PREMIUM_MONTHLY_PRODUCT_ID,
    title: 'Premium Monthly',
    periodLabel: 'Monthly access',
    valueLabel: 'Flexible subscription',
    fallbackPrice: MONTHLY_PRICE,
    storePrice: MONTHLY_PRICE,
  },
  {
    key: 'yearly',
    productId: PREMIUM_YEARLY_PRODUCT_ID,
    title: 'Premium Yearly',
    periodLabel: 'Yearly access',
    valueLabel: 'Best value',
    fallbackPrice: YEARLY_PRICE,
    storePrice: YEARLY_PRICE,
  },
];

export const PREMIUM_PLAN_PRODUCT_IDS = fallbackPlans.map(
  (plan) => plan.productId,
);

export function isPremiumProductId(productId?: string | null) {
  return Boolean(productId && PREMIUM_PLAN_PRODUCT_IDS.includes(productId));
}

export function getProductIdForPlan(plan: PremiumPlanKey) {
  return plan === 'monthly'
    ? PREMIUM_MONTHLY_PRODUCT_ID
    : PREMIUM_YEARLY_PRODUCT_ID;
}

export function buildPremiumPlanOptions(
  subscriptions: ProductSubscription[],
): PremiumPlanOption[] {
  return fallbackPlans.map((fallbackPlan) => {
    const storeProduct = subscriptions.find(
      (subscription) => subscription.id === fallbackPlan.productId,
    );

    return {
      ...fallbackPlan,
      title: storeProduct?.displayName ?? storeProduct?.title ?? fallbackPlan.title,
      storePrice: storeProduct?.displayPrice ?? fallbackPlan.fallbackPrice,
    };
  });
}

export function getPurchaseErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'The App Store purchase could not be completed. Please try again.';
}
