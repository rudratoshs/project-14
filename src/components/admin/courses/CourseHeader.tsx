import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface CourseHeaderProps {
  onBack: () => void;
  accessibility: string;
  type: string;
}

export default function CourseHeader({ onBack, accessibility, type }: CourseHeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant={accessibility === 'free' ? 'success' : 'default'}>
              {accessibility}
            </Badge>
            <Badge variant="outline">
              {type === 'image_theory' ? 'Image & Theory' : 'Video & Theory'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}