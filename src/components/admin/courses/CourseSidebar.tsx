import { BookOpen, Clock, GraduationCap, ImageIcon, Lock, Unlock, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { Course } from '@/lib/types/course';
import { ContentEditor } from './editors';

interface CourseSidebarProps {
  course: Course;
  onUpdateCourse: (data: Partial<Course>) => Promise<void>;
}

export function CourseSidebar({ course, onUpdateCourse }: CourseSidebarProps) {
  const completedTopics = course.topics.filter(t => t.status === 'complete').length;
  const topicProgress = (completedTopics / course.topics.length) * 100;

  // Ensure thumbnail URL is properly formatted
  const thumbnailUrl = course.thumbnail?.startsWith('http')
    ? course.thumbnail
    : course.thumbnail
      ? `${import.meta.env.VITE_API_URL}${course.thumbnail}`
      : null;

  return (
    <div className="col-span-3 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ContentEditor
            title={course.title}
            content={course.description}
            thumbnail={course.thumbnail}
            banner={course.banner}
            onSave={onUpdateCourse}
            type="course"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(topicProgress)}%</span>
            </div>
            <ProgressBar value={topicProgress} className="h-2" />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{course.topics.length} Topics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {course.type === 'image_theory' ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              <span>{course.type === 'image_theory' ? 'Image & Theory' : 'Video & Theory'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {course.accessibility === 'free' ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>{course.accessibility}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}