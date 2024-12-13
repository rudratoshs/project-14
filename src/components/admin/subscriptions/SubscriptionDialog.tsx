import { useEffect } from 'react';
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
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { createSubscriptionPlan, updateSubscriptionPlan } from '@/lib/api/subscriptions';
import { SubscriptionPlan } from '@/lib/types/subscription';
import { FeatureList } from './FeatureList';
import { IntervalSelect } from './IntervalSelect';

const planSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    interval: z.enum(['MONTHLY', 'YEARLY']),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    courseLimit: z.number().min(0, 'Course limit must be non-negative'),
    isActive: z.boolean(),
});

interface SubscriptionDialogProps {
    plan: SubscriptionPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function SubscriptionDialog({
    plan,
    open,
    onOpenChange,
    onSuccess,
}: SubscriptionDialogProps) {
    const { toast } = useToast();
    const form = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            interval: 'MONTHLY' as const,
            features: [''],
            courseLimit: 0,
            isActive: true,
        },
    });

    useEffect(() => {
        if (plan) {
            form.reset({
                name: plan.name,
                description: plan.description || '',
                price: plan.price,
                interval: plan.interval,
                features: plan.features,
                courseLimit: plan.courseLimit,
                isActive: plan.isActive,
            });
        } else {
            form.reset({
                name: '',
                description: '',
                price: 0,
                interval: 'MONTHLY',
                features: [''],
                courseLimit: 0,
                isActive: true,
            });
        }
    }, [plan, form]);

    const onSubmit = async (data: z.infer<typeof planSchema>) => {
        try {
            if (plan) {
                await updateSubscriptionPlan(plan.id, data);
                toast({
                    title: 'Success',
                    description: 'Subscription plan updated successfully',
                });
            } else {
                await createSubscriptionPlan(data);
                toast({
                    title: 'Success',
                    description: 'Subscription plan created successfully',
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save subscription plan',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader className="sticky top-0 bg-white z-10">
                    <DialogTitle>
                        {plan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[70vh] px-4">

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={plan?.name.toLowerCase() === 'free'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                disabled={plan?.name.toLowerCase() === 'free'}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interval"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Billing Interval</FormLabel>
                                        <IntervalSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={plan?.name.toLowerCase() === 'free'}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="courseLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Limit</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum number of courses a user can create (0 for unlimited)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Features</FormLabel>
                                    <FeatureList
                                        features={field.value}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                        <FormDescription>
                                            Disable to prevent new subscriptions to this plan
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}