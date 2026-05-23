export const FREE_PLAN_LIMIT = 1;
export const MONTHLY_PRICE = '\u00A36.99';
export const YEARLY_PRICE = '\u00A339.99';
export const PREMIUM_MONTHLY_PRODUCT_ID =
  'com.gardenopsai.app.premium.monthly';
export const PREMIUM_YEARLY_PRODUCT_ID =
  'com.gardenopsai.app.premium.yearly';

// TODO: Add server-side App Store receipt validation before enforcing premium
// access for real customer accounts across multiple devices.
export const PREMIUM_FEATURES = [
  'Unlimited AI plans',
  'Profit Mode',
  'Smart weather-based tasks',
] as const;
