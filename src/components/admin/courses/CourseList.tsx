import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Download, Plus } from 'lucide-react';
import { Course } from '@/lib/types/course';
import { getCourses } from '@/lib/api/courses';
import { debounce } from 'lodash';
import CourseGrid from './CourseGrid';
import CreateCourseDialog from './CreateCourseDialog';

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCourses = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch courses',
        });
      } finally {
        setLoading(false);
      }
    }, 300), // Debounce by 300ms
    []
  );

  useEffect(() => {
    fetchCourses();
    return fetchCourses.cancel; // Clean up the debounce on unmount
  }, [fetchCourses]);

  const handleCourseClick = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const exportCourses = () => {
    const headers = ['Title', 'Type', 'Accessibility', 'Topics', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...courses.map((course) =>
        [
          course.title,
          course.type,
          course.accessibility,
          course.topics.length,
          new Date(course.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'courses.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            Total Courses: {courses.length}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportCourses}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <CourseGrid
          courses={courses}
          onCourseClick={handleCourseClick}
          onCreateClick={handleCreateClick}
        />
      )}

      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchCourses}
      />
    </div>
  );
}