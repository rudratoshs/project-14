import { SubscriptionPlan } from '@prisma/client';

/**
 * Checks if a subscription plan includes specific features
 */
export function hasFeatures(plan: SubscriptionPlan, requiredFeatures: string[]): boolean {
  return requiredFeatures.every(feature => 
    plan.features.includes(feature)
  );
}

/**
 * Gets the features available for a course type
 */
export function getCourseTypeFeatures(type: string): string[] {
  switch (type.toLowerCase()) {
    case 'image_theory':
      return ['image_theory', 'theory_content'];
    case 'video_theory':
      return ['video_theory', 'theory_content'];
    default:
      return ['theory_content'];
  }
}

/**
 * Validates if a plan allows creating a specific course type
 */
export function canCreateCourseType(plan: SubscriptionPlan, courseType: string): boolean {
  const requiredFeatures = getCourseTypeFeatures(courseType);
  return hasFeatures(plan, requiredFeatures);
}

/**
 * Gets the maximum number of subtopics allowed for a plan
 */
export function getMaxSubtopics(plan: SubscriptionPlan): number {
  const features = plan.features as string[];
  const subtopicFeature = features.find(f => f.includes('subtopics_'));
  if (!subtopicFeature) return 3; // Default limit for free plan
  
  const limit = parseInt(subtopicFeature.split('_')[1]);
  return isNaN(limit) ? 3 : limit;
}