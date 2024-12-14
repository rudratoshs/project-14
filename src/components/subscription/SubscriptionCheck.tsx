import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { canCreateCourseType, getMaxSubtopics } from '@/lib/utils/subscription';
import { SubscriptionAlert } from './SubscriptionAlert';
import { SubscriptionUpgradeDialog } from './SubscriptionUpgradeDialog';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionCheckProps {
  courseType: string;
  numTopics: number;
  numSubtopics: number;
  onUpgrade?: () => void;
  children: React.ReactNode;
}

export function SubscriptionCheck({
  courseType,
  numTopics,
  numSubtopics,
  onUpgrade,
  children
}: SubscriptionCheckProps) {
  const { user: currentUser } = useAuth();
  const { subscription, loading } = useSubscription(currentUser);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  if (loading) {
    return <div>Loading subscription details...</div>;
  }
  if (!subscription) {
    return (
      <>
        <SubscriptionAlert
          feature="Course Creation"
          requiredPlan={subscription?.plan!}
          onUpgrade={() => setShowUpgradeDialog(true)}
        />
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={null}
          onUpgrade={onUpgrade}
        />
      </>
    );
  }

  const { plan } = subscription;

  if (!canCreateCourseType(plan, courseType)) {
    return (
      <>
        <SubscriptionAlert
          feature={`${courseType} Course Creation`}
          requiredPlan={plan}
          onUpgrade={() => setShowUpgradeDialog(true)}
        />
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={plan}
          onUpgrade={onUpgrade}
        />
      </>
    );
  }

  // Check course limit
  if (plan.courseLimit > 0 && numTopics > plan.courseLimit) {
    return (
      <>
        <SubscriptionAlert
          feature={`Creating ${numTopics} topics (limit: ${plan.courseLimit})`}
          requiredPlan={plan}
          onUpgrade={() => setShowUpgradeDialog(true)}
        />
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={plan}
          onUpgrade={onUpgrade}
        />
      </>
    );
  }

  // Check subtopics limit
  const maxSubtopics = getMaxSubtopics(plan);
  if (numSubtopics > maxSubtopics) {
    return (
      <>
        <SubscriptionAlert
          feature={`Creating ${numSubtopics} subtopics (limit: ${maxSubtopics})`}
          requiredPlan={plan}
          onUpgrade={() => setShowUpgradeDialog(true)}
        />
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={plan}
          onUpgrade={onUpgrade}
        />
      </>
    );
  }

  return <>{children}</>;
}