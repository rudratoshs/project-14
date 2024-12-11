import { Topic, Subtopic } from '@/lib/types/course';
import { JobProgress } from '@/lib/types/job';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Edit2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CourseProgress from './CourseProgress';

interface SubtopicItemProps {
  topic: Topic;
  subtopic: Subtopic;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (data: Partial<Subtopic>) => Promise<void>;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  progress: JobProgress | null;
}

export default function SubtopicItem({
  topic,
  subtopic,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onGenerate,
  isGenerating,
  progress,
}: SubtopicItemProps) {
  return (
    <div>
      <div
        className={cn(
          "p-4 rounded-lg border cursor-pointer transition-colors",
          isSelected ? "bg-primary/5 border-primary" : "hover:bg-gray-50"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {index + 1}. {subtopic.title}
            </span>
            <Badge variant={subtopic.status === 'complete' ? 'success' : 'secondary'}>
              {subtopic.status === 'complete' ? 'Complete' : 'In Progress'}
            </Badge>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">{subtopic.title}</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate({})}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Content
              </Button>
              {subtopic.status !== 'complete' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate Content
                </Button>
              )}
            </div>
          </div>

          {subtopic.content && (
            <div className="prose prose-gray max-w-none">
              <p>{subtopic.content}</p>
            </div>
          )}

          {isGenerating && progress && (
            <div className="mt-4">
              <CourseProgress progress={progress} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}