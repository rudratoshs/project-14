import { Badge } from '@/components/ui/badge';
import { UserSubscription } from '@/lib/types/subscription';
import { formatPrice } from '@/lib/utils/subscription';

interface SubscriptionBadgeProps {
  subscription: UserSubscription;
  className?: string;
}

export function SubscriptionBadge({ subscription, className }: SubscriptionBadgeProps) {
  const { plan } = subscription;
  
  const getBadgeVariant = () => {
    switch (plan.name.toLowerCase()) {
      case 'free':
        return 'secondary';
      case 'pro':
        return 'default';
      case 'enterprise':
        return 'success';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getBadgeVariant()} className={className}>
      {plan.name} - {formatPrice(plan.price, plan.interval)}
    </Badge>
  );
}