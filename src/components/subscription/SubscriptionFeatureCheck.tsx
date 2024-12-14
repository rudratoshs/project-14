import { useSubscription } from '@/hooks/useSubscription';
import { hasFeature } from '@/lib/utils/subscription';
import { SubscriptionAlert } from './SubscriptionAlert';
import { SubscriptionUpgradeDialog } from './SubscriptionUpgradeDialog';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionFeatureCheckProps {
  feature: string;
  children: React.ReactNode;
}

export function SubscriptionFeatureCheck({ feature, children }: SubscriptionFeatureCheckProps) {
  const { user: currentUser } = useAuth();
  const { subscription } = useSubscription(currentUser);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  // If no subscription, show upgrade prompt
  if (!subscription) {
    return (
      <>
        {/* <SubscriptionAlert
          feature={feature}
          requiredPlan={subscription?.plan!}
          onUpgrade={() => setShowUpgradeDialog(true)}
        /> */}
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={null}
        />
      </>
    );
  }

  // Check if the current plan includes the feature
  if (!hasFeature(subscription.plan, feature)) {
    return (
      <>
        <SubscriptionAlert
          feature={feature}
          requiredPlan={subscription.plan}
          onUpgrade={() => setShowUpgradeDialog(true)}
        />
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          currentPlan={subscription.plan}
        />
      </>
    );
  }

  return <>{children}</>;
}