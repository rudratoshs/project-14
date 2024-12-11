import { Topic, Subtopic } from '@/lib/types/course';
import { JobProgress } from '@/lib/types/job';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SubtopicItem from './SubtopicItem';

interface TopicListProps {
  topics: Topic[];
  selectedTopic: Topic | null;
  selectedSubtopic: Subtopic | null;
  onTopicSelect: (topic: Topic) => void;
  onSubtopicSelect: (subtopic: Subtopic) => void;
  onUpdateTopic: (topicId: string, data: Partial<Topic>) => Promise<void>;
  onUpdateSubtopic: (topicId: string, subtopicId: string, data: Partial<Subtopic>) => Promise<void>;
  onGenerateTopicContent: (topic: Topic) => Promise<void>;
  onGenerateSubtopicContent: (topicId: string, subtopicId: string) => Promise<void>;
  generatingTopicId: string | null;
  generatingSubtopicId: string | null;
  progress: JobProgress | null;
}

export default function TopicList({
  topics,
  selectedTopic,
  selectedSubtopic,
  onTopicSelect,
  onSubtopicSelect,
  onUpdateTopic,
  onUpdateSubtopic,
  onGenerateTopicContent,
  onGenerateSubtopicContent,
  generatingTopicId,
  generatingSubtopicId,
  progress,
}: TopicListProps) {
  return (
    <div className="space-y-6">
      {topics.map((topic) => (
        <div key={topic.id} className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{topic.title}</h3>
                <Badge variant={topic.status === 'complete' ? 'success' : 'secondary'}>
                  {topic.status === 'complete' ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateTopic(topic.id, {})}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Content
                </Button>
                {topic.status !== 'complete' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateTopicContent(topic)}
                    disabled={!!generatingTopicId}
                    className="gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generate Content
                  </Button>
                )}
              </div>
            </div>

            {topic.content && (
              <div className="prose prose-gray max-w-none mb-6">
                <p>{topic.content}</p>
              </div>
            )}

            {topic.subtopics && topic.subtopics.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Subtopics</h4>
                <div className="space-y-4">
                  {topic.subtopics.map((subtopic, index) => (
                    <SubtopicItem
                      key={subtopic.id}
                      topic={topic}
                      subtopic={subtopic}
                      index={index}
                      isSelected={selectedSubtopic?.id === subtopic.id}
                      onSelect={() => onSubtopicSelect(subtopic)}
                      onUpdate={(data) => onUpdateSubtopic(topic.id, subtopic.id, data)}
                      onGenerate={() => onGenerateSubtopicContent(topic.id, subtopic.id)}
                      isGenerating={generatingSubtopicId === subtopic.id}
                      progress={progress}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}