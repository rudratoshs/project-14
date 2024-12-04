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
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Minus } from 'lucide-react';
import { CreateCourseData } from '@/lib/types/course';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const formSchema = z.object({
  numTopics: z.number().min(1).max(20),
  subtopics: z.array(z.string()).optional(),
});

interface TopicsStepProps {
  data: Partial<CreateCourseData>;
  onUpdate: (data: Partial<CreateCourseData>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function TopicsStep({ data, onUpdate, onValidationChange }: TopicsStepProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numTopics: data.numTopics || 5,
      subtopics: data.subtopics || [''],
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

  const subtopics = form.watch('subtopics') || [''];

  const addSubtopic = () => {
    const current = form.getValues('subtopics') || [];
    form.setValue('subtopics', [...current, '']);
    handleFieldChange();
  };

  const removeSubtopic = (index: number) => {
    const current = form.getValues('subtopics') || [];
    form.setValue('subtopics', current.filter((_, i) => i !== index));
    handleFieldChange();
  };

  const handleFieldChange = () => {
    const values = form.getValues();
    onUpdate(values);
  };

  return (
    <Form {...form}>
      <form onChange={handleFieldChange} className="space-y-6">
        <FormField
          control={form.control}
          name="numTopics"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Number of Topics</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    handleFieldChange();
                  }}
                  defaultValue={field.value.toString()}
                  className="grid grid-cols-4 gap-4"
                >
                  {[5, 10, 15, 20].map((num) => (
                    <div key={num}>
                      <RadioGroupItem
                        value={num.toString()}
                        id={`topics_${num}`}
                        className="peer sr-only"
                      />
                      <FormLabel
                        htmlFor={`topics_${num}`}
                        className={cn(
                          "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 cursor-pointer",
                          field.value === num && "border-primary"
                        )}
                      >
                        <span className="text-sm font-medium">{num}</span>
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Choose how many main topics your course will have
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Suggested Subtopics (Optional)</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSubtopic}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subtopic
            </Button>
          </div>

          {subtopics.map((_, index) => (
            <div key={index} className="flex gap-2">
              <FormField
                control={form.control}
                name={`subtopics.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`Subtopic ${index + 1}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {subtopics.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeSubtopic(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </form>
    </Form>
  );
}