import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getUserSubscription } from '@/lib/api/subscriptions';
import { UserSubscription } from '@/lib/types/subscription';

export function useSubscription(user: any) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getUserSubscription(user.id);
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch subscription details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, toast]);

  return { subscription, loading };
}