import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertTriangle } from 'lucide-react';
import { User } from '@/lib/types/user';
import { UserSubscription } from '@/lib/types/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { formatPrice } from '@/lib/utils/subscription';
import { SubscriptionUpgradeDialog } from '@/components/subscription/SubscriptionUpgradeDialog';

interface UserSubscriptionPanelProps {
  user: User;
  onSubscriptionChange: () => void;
}

export default function UserSubscriptionPanel({ user, onSubscriptionChange }: UserSubscriptionPanelProps) {
  const { subscription, loading } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription</span>
          {subscription && (
            <Badge variant="outline" className={getStatusColor(subscription.status)}>
              {subscription.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-6">
            {/* Current Plan Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{subscription.plan.name} Plan</h3>
                <span className="text-2xl font-bold">
                  {formatPrice(subscription.plan.price, subscription.plan.interval)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription.plan.description}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2">
              <h4 className="font-medium">Features</h4>
              <ul className="space-y-2">
                {subscription.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Crown className="h-4 w-4 text-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscription Details */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date</span>
                <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">End Date</span>
                <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Upgrade/Manage Button */}
            <Button 
              className="w-full"
              onClick={() => setShowUpgradeDialog(true)}
            >
              <Crown className="mr-2 h-4 w-4" />
              {subscription.status === 'ACTIVE' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">No active subscription</p>
            </div>
            <Button 
              className="w-full"
              onClick={() => setShowUpgradeDialog(true)}
            >
              <Crown className="mr-2 h-4 w-4" />
              Choose a Plan
            </Button>
          </div>
        )}
      </CardContent>

      <SubscriptionUpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        currentPlan={subscription?.plan || null}
        onUpgrade={onSubscriptionChange}
      />
    </Card>
  );
}