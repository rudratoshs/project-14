import { SubscriptionPlan } from '../types/subscription';

/**
 * Formats the price with currency symbol
 */
export function formatPrice(price: number, interval: string): string {
  return `$${price}${price === Math.floor(price) ? '.00' : ''}/` +
    `${interval.toLowerCase() === 'monthly' ? 'mo' : 'yr'}`;
}

/**
 * Checks if a plan includes a specific feature
 */
export function hasFeature(plan: SubscriptionPlan, feature: string): boolean {
  return plan.features.includes(feature);
}

/**
 * Gets the maximum number of courses allowed for a plan
 */
export function getMaxCourses(plan: SubscriptionPlan): string {
  return plan.courseLimit === 0 ? 'Unlimited' : plan.courseLimit.toString();
}

/**
 * Gets the maximum number of subtopics allowed per topic
 */
export function getMaxSubtopics(plan: SubscriptionPlan): number {
  const subtopicFeature = plan.features.find(f => f.includes('subtopics_'));
  if (!subtopicFeature) return 3; // Default limit for free plan
  
  const limit = parseInt(subtopicFeature.split('_')[1]);
  return isNaN(limit) ? 3 : limit;
}

/**
 * Checks if a plan allows a specific course type
 */
export function canCreateCourseType(plan: SubscriptionPlan, type: string): boolean {
  switch (type.toLowerCase()) {
    case 'image_theory':
      return hasFeature(plan, 'image_generation');
    case 'video_theory':
      return hasFeature(plan, 'video_generation');
    default:
      return true;
  }
}

/**
 * Gets a list of available course types for a plan
 */
export function getAvailableCourseTypes(plan: SubscriptionPlan): string[] {
  const types = [];
  if (hasFeature(plan, 'image_generation')) types.push('image_theory');
  if (hasFeature(plan, 'video_generation')) types.push('video_theory');
  return types;
}

/**
 * Checks if a plan is upgradeable
 */
export function isUpgradeable(currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean {
  return targetPlan.price > currentPlan.price;
}