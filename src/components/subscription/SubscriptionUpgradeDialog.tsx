import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { useToast } from '@/components/ui/use-toast';
  import { Crown } from 'lucide-react';
  import { SubscriptionPlan } from '@/lib/types/subscription';
  import { getSubscriptionPlans, subscribeUser } from '@/lib/api/subscriptions';
  import { useAuth } from '@/contexts/AuthContext';
  import { useState, useEffect } from 'react';
  import { formatPrice } from '@/lib/utils/subscription';
  
  interface SubscriptionUpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPlan: SubscriptionPlan | null;
    onUpgrade?: () => void;
  }
  
  export function SubscriptionUpgradeDialog({
    open,
    onOpenChange,
    currentPlan,
    onUpgrade,
  }: SubscriptionUpgradeDialogProps) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
  
    useEffect(() => {
      const fetchPlans = async () => {
        try {
          const data = await getSubscriptionPlans();
          // Filter out plans with lower or equal price than current plan
          const upgradePlans = currentPlan
            ? data.filter(plan => plan.price > currentPlan.price)
            : data.filter(plan => plan.name.toLowerCase() !== 'free');
          setPlans(upgradePlans);
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
  
      if (open) {
        fetchPlans();
      }
    }, [open, currentPlan, toast]);
  
    const handleUpgrade = async (plan: SubscriptionPlan) => {
      if (!user) return;
  
      try {
        setUpgrading(true);
        await subscribeUser(user.id, plan.id);
        toast({
          title: 'Success',
          description: `Successfully upgraded to ${plan.name} plan`,
        });
        onUpgrade?.();
        onOpenChange(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to upgrade subscription',
        });
      } finally {
        setUpgrading(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Subscription</DialogTitle>
          </DialogHeader>
  
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold">
                      {formatPrice(plan.price, plan.interval)}
                    </p>
                  </div>
  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Crown className="h-4 w-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
  
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan)}
                    disabled={upgrading}
                  >
                    {upgrading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      'Upgrade Now'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }