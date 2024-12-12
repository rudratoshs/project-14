import { ProgressBar } from '@/components/ui/progress';
import { Alert } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionLimitIndicatorProps {
  current: number;
  limit: number;
  label: string;
  className?: string;
  showAlert?: boolean;
}

export function SubscriptionLimitIndicator({
  current,
  limit,
  label,
  className,
  showAlert = true
}: SubscriptionLimitIndicatorProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isAtLimit ? "text-red-600" : 
          isNearLimit ? "text-yellow-600" : 
          "text-green-600"
        )}>
          {current} / {limit}
        </span>
      </div>
      
      <ProgressBar 
        value={percentage} 
        className={cn(
          "h-2",
          isAtLimit ? "bg-red-100" : 
          isNearLimit ? "bg-yellow-100" : 
          "bg-green-100"
        )}
        indicatorClassName={cn(
          isAtLimit ? "bg-red-500" : 
          isNearLimit ? "bg-yellow-500" : 
          "bg-green-500"
        )}
      />

      {showAlert && isNearLimit && !isAtLimit && (
        <Alert variant="warning" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">
            You're approaching your {label.toLowerCase()} limit. Consider upgrading your plan.
          </span>
        </Alert>
      )}

      {showAlert && isAtLimit && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">
            You've reached your {label.toLowerCase()} limit. Upgrade your plan to continue.
          </span>
        </Alert>
      )}
    </div>
  );
}