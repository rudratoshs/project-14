import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionLimitIndicator } from '@/components/subscription/SubscriptionLimitIndicator';
import { SubscriptionFeatureCheck } from '@/components/subscription/SubscriptionFeatureCheck';
import { getUserCourseCurrentCount } from '@/lib/utils/subscription';
import { CreateCourseData } from '@/lib/types/course';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Title can only contain letters, numbers, spaces, hyphens, and underscores')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  type: z.enum(['image_theory', 'video_theory']),
  accessibility: z.enum(['free', 'paid', 'limited']),
});

interface BasicInfoStepProps {
  data: Partial<CreateCourseData>;
  onUpdate: (data: Partial<CreateCourseData>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function BasicInfoStep({ data, onUpdate, onValidationChange }: BasicInfoStepProps) {
  const { user: currentUser } = useAuth();
  const { subscription } = useSubscription(currentUser);
  const [courseCount, setCourseCount] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'image_theory',
      accessibility: data.accessibility || 'free',
    },
    mode: 'onChange',
  });

  // Fetch user course count
  useEffect(() => {
    if (currentUser) {
      getUserCourseCurrentCount(currentUser.id)
        .then((count) => setCourseCount(count))
        .catch((error) => console.error('Error fetching course count:', error));
    }
  }, [currentUser]);

  const canCreateCourse =
    subscription?.plan &&
    (subscription.plan.courseLimit === 0 || (courseCount ?? 0) < subscription.plan.courseLimit);

  const availableCourseTypes = subscription?.plan
    ? subscription.plan.features.includes('video_generation')
      ? ['image_theory', 'video_theory']
      : ['image_theory']
    : ['image_theory'];
  useEffect(() => {
    const subscription = form.watch(() => {
      const isValid = form.formState.isValid && canCreateCourse;
      onValidationChange(isValid);
    });
    return () => subscription.unsubscribe();
  }, [form, canCreateCourse, onValidationChange]);

  const handleFieldChange = () => {
    const values = form.getValues();
    onUpdate(values);
  };

  return (
    <div className="space-y-6">
      {subscription?.plan && subscription.plan.courseLimit > 0 && courseCount !== null && (
        <SubscriptionLimitIndicator
          current={courseCount}
          limit={subscription.plan.courseLimit}
          label="Course Limit"
        />
      )}

      {!canCreateCourse && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>You've reached your course limit. Please upgrade your plan to create more courses.</span>
        </Alert>
      )}

      <Form {...form}>
        <form onChange={handleFieldChange} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  Course Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter a descriptive title"
                    className={cn(
                      'transition-colors',
                      form.formState.errors.title && 'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                </FormControl>
                <FormDescription>
                  Use a clear, descriptive title that reflects the course content
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe what students will learn"
                    className={cn(
                      'min-h-[100px] resize-none transition-colors',
                      form.formState.errors.description && 'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the course objectives and outcomes
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={
                      availableCourseTypes.length === 1 ? availableCourseTypes[0] : field.value
                    }
                  >
                    {['image_theory', 'video_theory'].map((type) => {
                      return (
                        <SubscriptionFeatureCheck key={type} feature={type}>
                          <RadioGroupItem
                            value={type}
                            id={type}
                            disabled={!availableCourseTypes.includes(type)}
                          >
                            {type === 'image_theory' ? 'Image & Theory' : 'Video & Theory'}
                          </RadioGroupItem>
                        </SubscriptionFeatureCheck>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accessibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accessibility</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course accessibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="limited">Limited Free</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Choose how users can access your course</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}