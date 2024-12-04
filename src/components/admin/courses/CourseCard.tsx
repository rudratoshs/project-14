import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Course } from '@/lib/types/course';
import { useJobProgress } from '@/hooks/useJobProgress';
import { BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const { progress } = useJobProgress(course.jobId || null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const isGenerating = progress?.status === 'processing';
  
  useEffect(() => {
    // Update thumbnail URL when progress includes a result with thumbnail
    if (progress?.result?.thumbnail) {
      setThumbnailUrl(progress.result.thumbnail);
    } else if (course.thumbnail) {
      setThumbnailUrl(
        course.thumbnail.startsWith('http') 
          ? course.thumbnail 
          : `${import.meta.env.VITE_API_URL}${course.thumbnail}`
      );
    }
  }, [progress?.result?.thumbnail, course.thumbnail]);
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    if (isGenerating) {
      return progress.progress || 0;
    }

    // Calculate based on completed topics and subtopics
    const totalTopics = course.topics.length;
    if (totalTopics === 0) return 0;

    let completedCount = 0;
    let totalCount = 0;

    course.topics.forEach(topic => {
      if (topic.subtopics?.length) {
        const completedSubtopics = topic.subtopics.filter(sub => sub.status === 'complete').length;
        completedCount += completedSubtopics;
        totalCount += topic.subtopics.length;
      } else {
        if (topic.status === 'complete') completedCount++;
        totalCount++;
      }
    });

    return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  };

  const completionPercent = calculateCompletion();

  // Get progress color based on completion percentage or generation status
  const getProgressColor = () => {
    if (isGenerating) return 'bg-blue-500';
    if (completionPercent === 100) return 'bg-green-500';
    if (completionPercent >= 75) return 'bg-emerald-500';
    if (completionPercent >= 50) return 'bg-yellow-500';
    if (completionPercent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get status text color
  const getStatusColor = () => {
    if (isGenerating) return 'text-blue-600';
    if (completionPercent === 100) return 'text-green-600';
    if (completionPercent >= 75) return 'text-emerald-600';
    if (completionPercent >= 50) return 'text-yellow-600';
    if (completionPercent >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group",
        isGenerating && "animate-pulse"
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.classList.add('hidden');
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-50",
          thumbnailUrl && "hidden"
        )}>
          <BookOpen className="h-12 w-12 text-muted-foreground/20" />
        </div>
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold line-clamp-2">{course.title}</h3>
          <div className="flex-shrink-0">
            <Badge variant={course.accessibility === 'free' ? 'success' : 'default'}>
              {course.accessibility}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date(course.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-gray-50/50 p-4">
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            {isGenerating ? (
              <>
                <span className="animate-pulse text-blue-600">
                  {progress.currentStep}
                  {progress.subStep && ` - ${progress.subStep}`}
                </span>
                <span className="text-blue-600">{Math.round(progress.progress)}%</span>
              </>
            ) : (
              <>
                <span className={getStatusColor()}>
                  {completionPercent === 100 ? 'Complete' : 'In Progress'}
                </span>
                <span className={getStatusColor()}>
                  {Math.round(completionPercent)}%
                </span>
              </>
            )}
          </div>
          <ProgressBar 
            value={isGenerating ? progress.progress : completionPercent} 
            className={cn(
              "h-2 transition-colors duration-500",
              getProgressColor()
            )}
          />
          {isGenerating && progress.details && (
            <div className="text-xs text-muted-foreground space-y-1">
              {progress.details.currentTopic && (
                <p className="truncate">{progress.details.currentTopic}</p>
              )}
              {progress.details.currentImage && (
                <p className="truncate italic">{progress.details.currentImage}</p>
              )}
              <div className="flex gap-4">
                {progress.details.topicsCompleted !== undefined && (
                  <p>Topics: {progress.details.topicsCompleted} / {progress.details.totalTopics}</p>
                )}
                {progress.details.imagesCompleted !== undefined && (
                  <p>Images: {progress.details.imagesCompleted} / {progress.details.totalImages}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}