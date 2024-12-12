import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { getSubscriptionPlans } from '@/lib/api/subscriptions';
import SubscriptionTable from './SubscriptionTable';
import SubscriptionDialog from './SubscriptionDialog';

export default function SubscriptionList() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch subscription plans',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">
            Manage subscription plans and features
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <SubscriptionTable
            plans={plans}
            onPlanChange={fetchPlans}
            loading={loading}
          />
        </CardContent>
      </Card>

      <SubscriptionDialog
        plan={null}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchPlans}
      />
    </div>
  );
}