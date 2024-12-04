import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateCourseData } from '@/lib/types/course';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Title can only contain letters, numbers, spaces, hyphens, and underscores')
    .trim()
    .refine((val) => val.length > 0, {
      message: "Title is required"
    }),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .refine((val) => val.length > 0, {
      message: "Description is required"
    }),
  type: z.enum(['image_theory', 'video_theory']),
  accessibility: z.enum(['free', 'paid', 'limited']),
});

interface BasicInfoStepProps {
  data: Partial<CreateCourseData>;
  onUpdate: (data: Partial<CreateCourseData>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function BasicInfoStep({ data, onUpdate, onValidationChange }: BasicInfoStepProps) {
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

  // Watch form state changes to update validation
  useEffect(() => {
    const subscription = form.watch(() => {
      const isValid = form.formState.isValid;
      onValidationChange(isValid);
    });
    return () => subscription.unsubscribe();
  }, [form, onValidationChange]);

  // Update parent form data on field changes
  const handleFieldChange = () => {
    const values = form.getValues();
    onUpdate(values);
  };

  return (
    <Form {...form}>
      <form onChange={handleFieldChange} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Course Title
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter a descriptive title"
                  className={cn(
                    "transition-colors",
                    form.formState.errors.title && "border-red-500 focus-visible:ring-red-500"
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
                Description
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe what students will learn"
                  className={cn(
                    "min-h-[100px] resize-none transition-colors",
                    form.formState.errors.description && "border-red-500 focus-visible:ring-red-500"
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
            <FormItem className="space-y-3">
              <FormLabel>Course Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="image_theory"
                      id="image_theory"
                      className="peer sr-only"
                    />
                    <FormLabel
                      htmlFor="image_theory"
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 cursor-pointer",
                        field.value === "image_theory" && "border-primary"
                      )}
                    >
                      <span className="text-sm font-medium">Image & Theory</span>
                    </FormLabel>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="video_theory"
                      id="video_theory"
                      className="peer sr-only"
                    />
                    <FormLabel
                      htmlFor="video_theory"
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 cursor-pointer",
                        field.value === "video_theory" && "border-primary"
                      )}
                    >
                      <span className="text-sm font-medium">Video & Theory</span>
                    </FormLabel>
                  </div>
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
              <FormDescription>
                Choose how users can access your course
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}