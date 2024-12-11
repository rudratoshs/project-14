import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Wand2 } from 'lucide-react';
import { Topic, Subtopic } from '@/lib/types/course';
import { JobProgress } from '@/lib/types/job';
import { cn } from '@/lib/utils';
import { ContentEditor } from './editors';
import CourseProgress from './CourseProgress';

interface SubtopicListProps {
  topic: Topic;
  selectedSubtopic: Subtopic | null;
  onSubtopicSelect: (subtopic: Subtopic) => void;
  onUpdateSubtopic: (subtopicId: string, data: Partial<Subtopic>) => Promise<void>;
  onGenerateContent: (subtopicId: string) => Promise<void>;
  generatingSubtopicId: string | null;
  progress: JobProgress | null;
}

export default function SubtopicList({
  topic,
  selectedSubtopic,
  onSubtopicSelect,
  onUpdateSubtopic,
  onGenerateContent,
  generatingSubtopicId,
  progress,
}: SubtopicListProps) {
  if (!topic.subtopics?.length) return null;

  return (
    <div className="mt-6 space-y-4">
      <h5 className="font-medium">Subtopics</h5>
      <div className="space-y-4">
        {topic.subtopics.map((subtopic) => (
          <div key={subtopic.id}>
            <div
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-colors",
                selectedSubtopic?.id === subtopic.id
                  ? "bg-primary/5 border-primary"
                  : "hover:bg-gray-50"
              )}
              onClick={() => onSubtopicSelect(subtopic)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{subtopic.title}</span>
                  <Badge variant={subtopic.status === 'complete' ? 'success' : 'secondary'}>
                    {subtopic.status === 'complete' ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {selectedSubtopic?.id === subtopic.id && (
              <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                <ContentEditor
                  title={subtopic.title}
                  content={subtopic.content}
                  thumbnail={subtopic.thumbnail}
                  banner={subtopic.banner}
                  onSave={(data) => onUpdateSubtopic(subtopic.id, data)}
                  type="subtopic"
                />

                {subtopic.status !== 'complete' && (
                  <div className="mt-4">
                    {generatingSubtopicId === subtopic.id && progress ? (
                      <CourseProgress progress={progress} />
                    ) : (
                      <Button
                        onClick={() => onGenerateContent(subtopic.id)}
                        disabled={!!generatingSubtopicId}
                        className="w-full"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Content
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}