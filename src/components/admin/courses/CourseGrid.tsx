import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProgressBar } from '@/components/ui/progress';
import { Course } from '@/lib/types/course';
import { useJobProgress } from '@/hooks/useJobProgress';
import { Search, Filter, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseGridProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

export default function CourseGrid({ courses, onCourseClick }: CourseGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string | null>(null);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || course.type === selectedType;
    const matchesAccessibility = !selectedAccessibility || course.accessibility === selectedAccessibility;
    return matchesSearch && matchesType && matchesAccessibility;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedType || "all"}
            onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image_theory">Image & Theory</SelectItem>
              <SelectItem value="video_theory">Video & Theory</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedAccessibility || "all"}
            onValueChange={(value) => setSelectedAccessibility(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by accessibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Types</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="limited">Limited Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} onClick={() => onCourseClick(course)} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Courses Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

function CourseCard({ course, onClick }: CourseCardProps) {
  const { progress } = useJobProgress(course.jobId || null);
  const isGenerating = progress && progress.status === 'processing';
  
  // Calculate completion percentage based on topics
  const completedTopics = course.topics.filter(t => t.status === 'complete').length;
  const completionPercent = isGenerating 
    ? progress.progress 
    : (completedTopics / course.topics.length) * 100;

  // Ensure thumbnail URL is properly formatted
  const thumbnailUrl = course.thumbnail?.startsWith('http') 
    ? course.thumbnail 
    : course.thumbnail 
      ? `${import.meta.env.VITE_API_URL}${course.thumbnail}`
      : null;

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
              // Fallback to placeholder on error
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
            <span>{isGenerating ? 'Generating...' : 'Complete'}</span>
            <span>{Math.round(completionPercent)}%</span>
          </div>
          <ProgressBar value={completionPercent} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}