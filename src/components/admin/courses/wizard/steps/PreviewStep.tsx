import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Wand2 } from 'lucide-react';
import { CreateCourseData } from '@/lib/types/course';
import { previewCourseContent } from '@/lib/api/courses';
import { useToast } from '@/components/ui/use-toast';

interface PreviewStepProps {
  data: CreateCourseData;
  onProceed: () => void;
  onModify: () => void;
}

export default function PreviewStep({ data, onProceed, onModify }: PreviewStepProps) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={onModify}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Modify
          </Button>
          <Button onClick={onProceed}>
            Generate Course
            <Wand2 className="h-4 w-4 ml-2" />
          </Button>
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