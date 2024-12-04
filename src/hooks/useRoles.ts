import { useState, useEffect } from 'react';
import { Role } from '@/lib/types/role';
import { getRoles } from '@/lib/api/roles';
import { useToast } from '@/components/ui/use-toast';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch roles',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [toast]);

  return { roles, loading };
}