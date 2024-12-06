import { ProgressBar } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobProgress } from '@/lib/types/job';
import { CheckCircle2, XCircle, Loader2, BookOpen, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
      {/* Main Progress */}
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
            {Math.round(progress.progress)}%
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

      {/* Detailed Progress */}
      {progress.details && (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-3">
            <div className="grid gap-4">
              {/* Topics Progress */}
              {progress.details.topicsCompleted !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Topics Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {progress.details.topicsCompleted} / {progress.details.totalTopics}
                      </span>
                    </div>
                    <ProgressBar
                      value={(progress.details.topicsCompleted / progress.details.totalTopics) * 100}
                      className="h-1.5 bg-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Images Progress */}
              {progress.details.imagesCompleted !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Images Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {progress.details.imagesCompleted} / {progress.details.totalImages}
                      </span>
                    </div>
                    <ProgressBar
                      value={(progress.details.imagesCompleted / progress.details.totalImages) * 100}
                      className="h-1.5 bg-purple-500/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current Activity */}
            {(progress.details.currentTopic || progress.details.currentImage) && (
              <div className="mt-4 space-y-2 border-t pt-3">
                {progress.details.currentTopic && (
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-muted-foreground flex-1">
                      {progress.details.currentTopic}
                    </p>
                  </div>
                )}
                {progress.details.currentImage && (
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                    <p className="text-sm text-muted-foreground flex-1 italic">
                      {progress.details.currentImage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Indicators */}
      {isCompleted && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Generation completed successfully!</AlertDescription>
        </Alert>
      )}

      {isFailed && (
        <Alert className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{progress.error || 'Generation failed'}</AlertDescription>
        </Alert>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating content...</span>
        </div>
      )}
    </div>
  );
}