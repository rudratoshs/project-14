import { useSubscription } from '@/hooks/useSubscription';
import { hasFeature } from '@/lib/utils/subscription';
import { SubscriptionAlert } from './SubscriptionAlert';
import { SubscriptionUpgradeDialog } from './SubscriptionUpgradeDialog';
import { useState } from 'react';

interface SubscriptionFeatureCheckProps {
  feature: string;
  children: React.ReactNode;
}

export function SubscriptionFeatureCheck({ feature, children }: SubscriptionFeatureCheckProps) {
  const { subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // If no subscription, show upgrade prompt
  if (!subscription) {
    return (
      <>
        <SubscriptionAlert
          feature={feature}
          requiredPlan={null}
          onUpgrade={() => setShowUpgradeDialog(true)}
        />
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