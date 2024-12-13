import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createUser, updateUser } from '@/lib/api/users';
import { getSubscriptionPlans } from '@/lib/api/subscriptions';
import { User } from '@/lib/types/user';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { useRoles } from '@/hooks/useRoles';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  roleId: z.string().min(1, 'Role is required'),
  subscriptionPlan: z.string(), // Dynamic string
});

type FormData = z.infer<typeof userSchema>;

interface UserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function UserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserDialogProps) {
  const { toast } = useToast();
  const { roles } = useRoles();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const form = useForm<FormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: '',
      subscriptionPlan: '',
    },
  });

  useEffect(() => {
    if (user) {
      const activeSubscription = user.subscriptions?.find(
        (sub) => sub.status === 'ACTIVE'
      );

      form.reset({
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        subscriptionPlan: activeSubscription?.plan.name || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        roleId: '',
        subscriptionPlan: '',
      });
    }
  }, [user, form]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (error) {
        console.error('Failed to fetch subscription plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const selectedPlan = subscriptionPlans.find(
        (plan) => plan.name === data.subscriptionPlan
      );

      if (!selectedPlan) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Selected subscription plan is invalid',
        });
        return;
      }

      const updateData = {
        ...data,
        planId: selectedPlan.id, // Map to subscription plan ID
      };

      if (user) {
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(user.id, updateData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        if (!updateData.password) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Password is required for new users',
          });
          return;
        }
        await createUser(updateData);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: user ? 'Failed to update user' : 'Failed to create user',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{user ? 'New Password (optional)' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscriptionPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subscriptionPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.name}>
                          {plan.name} (${plan.price} / {plan.interval.toLowerCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}