import { useEffect, useState } from 'react';
import { CreateCourseData } from '@/lib/types/course';
import { createCourse } from '@/lib/api/courses';
import { useToast } from '@/components/ui/use-toast';
import CourseProgress from '../../CourseProgress';
import { useJobProgress } from '@/hooks/useJobProgress';

interface GenerationStepProps {
  data: CreateCourseData;
  onSuccess: () => void;
  onJobIdChange: (jobId: string) => void;
}

export default function GenerationStep({
  data,
  onSuccess,
  onJobIdChange,
}: GenerationStepProps) {
  const { toast } = useToast();
  const [jobId, setJobId] = useState<string | null>(null);
  const { progress, error } = useJobProgress(jobId);

  useEffect(() => {
    const startGeneration = async () => {
      try {
        const response = await createCourse(data);
        if (response.jobId) {
          setJobId(response.jobId);
          onJobIdChange(response.jobId);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to start course generation',
        });
      }
    };

    startGeneration();
  }, []);

  useEffect(() => {
    if (progress?.status === 'completed') {
      toast({
        title: 'Success',
        description: 'Course generated successfully!',
      });
      onSuccess();
    }
  }, [progress?.status]);

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <CourseProgress progress={progress} />;
}