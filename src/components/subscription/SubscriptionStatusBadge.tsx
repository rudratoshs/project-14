import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/lib/utils/subscription';

interface SubscriptionStatusBadgeProps {
  className?: string;
  showPrice?: boolean;
}

export function SubscriptionStatusBadge({ className, showPrice = false }: SubscriptionStatusBadgeProps) {
  const { subscription } = useSubscription();

  if (!subscription) {
    return (
      <Badge variant="outline" className={cn("bg-gray-100", className)}>
        Free Plan
      </Badge>
    );
  }

  const { plan, status } = subscription;

  const variants = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-primary/10 text-primary",
    enterprise: "bg-purple-100 text-purple-800",
  };

  const variant = variants[plan.name.toLowerCase() as keyof typeof variants] || variants.free;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1",
        variant,
        className
      )}
    >
      <Crown className="h-3 w-3" />
      {plan.name}
      {showPrice && (
        <span className="ml-1">
          ({formatPrice(plan.price, plan.interval)})
        </span>
      )}
    </Badge>
  );
}