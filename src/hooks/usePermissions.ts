import { useState, useEffect } from 'react';
import { Permission } from '@/lib/types/permission';
import { getPermissions } from '@/lib/api/permissions';
import { useToast } from '@/components/ui/use-toast';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await getPermissions();
        setPermissions(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch permissions',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [toast]);

  return { permissions, loading };
}