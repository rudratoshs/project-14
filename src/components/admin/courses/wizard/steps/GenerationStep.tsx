import { useEffect, useState } from 'react';
import { CreateCourseData } from '@/lib/types/course';
import { createCourse } from '@/lib/api/courses';
import { useToast } from '@/components/ui/use-toast';
import CourseProgress from '../../CourseProgress';
import { useJobProgress } from '@/hooks/useJobProgress';
import { Card, CardContent } from '@/components/ui/card';
import AIRobotLoader from '@/components/ui/ai-robot-loader'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        console.log('Starting course generation with data:', data);
        const response = await createCourse(data);
        console.log('Course generation started:', response);
        if (response.jobId) {
          setJobId(response.jobId);
          onJobIdChange(response.jobId);
        }
      } catch (error) {
        console.error('Failed to start course generation:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to start course generation',
        });
      }
    };

    startGeneration();
  }, [data, onJobIdChange, toast]);

  useEffect(() => {
    if (progress?.status === 'completed') {
      console.log('Course generation completed:', progress);
      toast({
        title: 'Success',
        description: 'Course generated successfully!',
      });
      onSuccess();
    } else if (progress?.status === 'failed') {
      console.error('Course generation failed:', progress.error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: progress.error || 'Course generation failed',
      });
    }
  }, [progress?.status, progress?.error, onSuccess, toast]);

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Generation Failed</h3>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <AIRobotLoader size="small" primaryColor="#3B82F6" secondaryColor="#2563EB" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Starting Generation</h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we initialize the course generation...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {/* Generation Status */}
          <div className="flex items-center justify-center mb-6">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              progress.status === 'completed' && "bg-green-50",
              progress.status === 'failed' && "bg-red-50",
              progress.status === 'processing' && "bg-blue-50"
            )}>
              {progress.status === 'completed' ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : progress.status === 'failed' ? (
                <XCircle className="w-8 h-8 text-red-500" />
              ) : (
                <AIRobotLoader size="small" primaryColor="#3B82F6" secondaryColor="#2563EB" />
              )}
            </div>
          </div>

          {/* Progress Tracking */}
          <CourseProgress progress={progress} />
        </CardContent>
      </Card>
    </div>
  );
}