import { ProgressBar } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobProgress } from '@/lib/types/job';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseProgressProps {
  progress: JobProgress | null;
  className?: string;
}

export default function CourseProgress({ progress, className }: CourseProgressProps) {
  if (!progress) return null;

  const isCompleted = progress.status === 'completed';
  const isFailed = progress.status === 'failed';
  const isProcessing = progress.status === 'processing';

  const getProgressColor = () => {
    if (isFailed) return 'bg-red-500';
    if (isCompleted) return 'bg-green-500';
    if (progress.progress >= 75) return 'bg-emerald-500';
    if (progress.progress >= 50) return 'bg-yellow-500';
    if (progress.progress >= 25) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={cn(
            "text-muted-foreground",
            isProcessing && "animate-pulse"
          )}>
            {progress.currentStep}
            {progress.subStep && ` - ${progress.subStep}`}
          </span>
          <span className={cn(
            "font-medium",
            isCompleted && "text-green-600",
            isFailed && "text-red-600",
            isProcessing && "text-blue-600"
          )}>
            {progress.progress}%
          </span>
        </div>
        <ProgressBar 
          value={progress.progress} 
          className={cn(
            "h-2 transition-colors duration-500",
            getProgressColor()
          )}
        />
      </div>

      {/* Details */}
      {progress.details && (
        <div className="space-y-2 text-sm">
          {progress.details.currentTopic && (
            <p className="text-muted-foreground">
              {progress.details.currentTopic}
            </p>
          )}
          {progress.details.currentImage && (
            <p className="text-muted-foreground italic">
              {progress.details.currentImage}
            </p>
          )}
          <div className="flex gap-4">
            {progress.details.topicsCompleted !== undefined && (
              <p className={cn(
                "text-muted-foreground",
                isProcessing && "animate-pulse"
              )}>
                Topics: {progress.details.topicsCompleted} / {progress.details.totalTopics}
              </p>
            )}
            {progress.details.imagesCompleted !== undefined && (
              <p className={cn(
                "text-muted-foreground",
                isProcessing && "animate-pulse"
              )}>
                Images: {progress.details.imagesCompleted} / {progress.details.totalImages}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {isCompleted && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Content generation completed successfully!</AlertDescription>
        </Alert>
      )}

      {isFailed && (
        <Alert className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{progress.error || 'Content generation failed'}</AlertDescription>
        </Alert>
      )}

      {isProcessing && progress.details?.currentTopic && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{progress.details.currentTopic}</span>
        </div>
      )}
    </div>
  );
}