import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { formatPrice } from '@/lib/utils/subscription';

interface SubscriptionAlertProps {
  feature: string;
  requiredPlan: SubscriptionPlan;
  onUpgrade?: () => void;
}
export function SubscriptionAlert({ feature, requiredPlan, onUpgrade }: SubscriptionAlertProps) {
  return (
    <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Subscription Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-yellow-700">
          {feature} is only available on the {requiredPlan.name} plan or higher.
          Upgrade now for {formatPrice(requiredPlan.price, requiredPlan.interval)} to unlock this feature.
        </p>
        {onUpgrade && (
          <Button
            onClick={onUpgrade}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to {requiredPlan.name}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}