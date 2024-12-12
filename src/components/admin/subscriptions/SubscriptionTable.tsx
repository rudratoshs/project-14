import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { useToast } from '@/components/ui/use-toast';
import { deleteSubscriptionPlan } from '@/lib/api/subscriptions';
import SubscriptionDialog from './SubscriptionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IconButton } from 'rsuite';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';

interface SubscriptionTableProps {
  plans: SubscriptionPlan[];
  onPlanChange: () => void;
  loading?: boolean;
}

export default function SubscriptionTable({
  plans,
  onPlanChange,
  loading,
}: SubscriptionTableProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (plan.name.toLowerCase() === 'free') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot delete the free plan',
      });
      return;
    }

    try {
      await deleteSubscriptionPlan(plan.id);
      toast({
        title: 'Success',
        description: 'Subscription plan deleted successfully',
      });
      onPlanChange();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete subscription plan',
      });
    } finally {
      setPlanToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Course Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>${plan.price}</TableCell>
                <TableCell>{plan.interval}</TableCell>
                <TableCell>{plan.courseLimit}</TableCell>
                <TableCell>
                  <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(plan.features as string[]).map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      appearance="subtle"
                      style={{ color: 'blue' }}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsDialogOpen(true);
                      }}
                    />
                    <IconButton
                      icon={<TrashIcon />}
                      size="sm"
                      appearance="ghost"
                      style={{
                        color: plan.name.toLowerCase() === 'free' ? 'gray' : 'red',
                        cursor: plan.name.toLowerCase() === 'free' ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => setPlanToDelete(plan)}
                      disabled={plan.name.toLowerCase() === 'free'}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SubscriptionDialog
        plan={selectedPlan}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={onPlanChange}
      />

      <AlertDialog
        open={!!planToDelete}
        onOpenChange={() => setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscription plan
              and may affect users currently subscribed to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => planToDelete && handleDelete(planToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}