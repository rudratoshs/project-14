import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Wand2, Radiation } from 'lucide-react';
import { CreateCourseData } from '@/lib/types/course';
import { previewCourseContent } from '@/lib/api/courses';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface PreviewStepProps {
  data: CreateCourseData;
  onProceed: () => void;
  onModify: () => void;
}

export default function PreviewStep({ data, onProceed, onModify }: PreviewStepProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleProceed = (generationType: 'partial' | 'full') => {
    data.courseGenertionType = generationType;
    onProceed();
  };

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setLoading(true);
        const result = await previewCourseContent(data);
        setPreview(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate preview',
        });
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Preview</h3>
        <div className="flex gap-4">
          {/* Modify Button */}
          <div>
            <Button variant="outline" onClick={onModify} data-tooltip-id="modify-tooltip">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Modify
            </Button>
            <Tooltip
              id="modify-tooltip"
              place="top"
              effect="float"
              delayShow={100}
              delayHide={200}
              className="tooltip-green"
            >
              Modify the course structure before starting the generation process.
            </Tooltip>
          </div>

          {/* Partial Generation Button */}
          <div>
            <Button variant="orange" onClick={() => handleProceed('partial')} data-tooltip-id="partial-tooltip">
              Generate Partially
              <Radiation className="h-4 w-4 ml-2" />
            </Button>
            <Tooltip
              id="partial-tooltip"
              place="top"
              effect="float"
              delayShow={150}
              delayHide={250}
              className="tooltip-green"
            >
              <div>
                <strong>Partial Generation:</strong>
                <p className="mt-1">
                  Generates the course description, banner, thumbnail, and one main topic fully (with
                  subtopics, content, and images). The remaining topics need to be generated manually.
                </p>
              </div>
            </Tooltip>
          </div>

          {/* Full Generation Button */}
          <div>
            <Button onClick={() => handleProceed('full')} data-tooltip-id="full-tooltip">
              Generate Fully
              <Wand2 className="h-4 w-4 ml-2" />
            </Button>
            <Tooltip
              id="full-tooltip"
              place="top"
              effect="float"
              delayShow={200}
              delayHide={300}
              className="tooltip-green"
            >
              <div>
                <strong>Full Generation:</strong>
                <p className="mt-1">
                  Generates the course description, banner, thumbnail, and all main topics fully (with
                  subtopics, content, and images).
                </p>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {preview?.topics?.map((topic: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">
                Topic {index + 1}: {topic.title}
              </h4>
              <div className="pl-4 border-l-2 border-gray-200">
                <p className="text-sm text-muted-foreground mb-2">
                  Subtopics:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {topic.subtopics.map((subtopic: any, subIndex: number) => (
                    <li key={subIndex}>{subtopic.title}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}