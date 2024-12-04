import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Course } from '@/lib/types/course';
import { useToast } from '@/components/ui/use-toast';
import { deleteCourse } from '@/lib/api/courses';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IconButton } from 'rsuite';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';
import EyeRoundIcon from '@rsuite/icons/EyeRound';
import CreateCourseDialog from './CreateCourseDialog';
import CourseProgress from './CourseProgress';
import { useJobProgress } from '@/hooks/useJobProgress';

interface CourseTableProps {
  courses: Course[];
  onCourseChange: () => void;
  loading?: boolean;
}

export default function CourseTable({
  courses,
  onCourseChange,
  loading,
}: CourseTableProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const { toast } = useToast();
  const { progress } = useJobProgress(selectedCourse?.jobId || null);

  const handleDelete = async (course: Course) => {
    try {
      await deleteCourse(course.id);
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
      onCourseChange();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete course',
      });
    } finally {
      setCourseToDelete(null);
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Accessibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{getTypeBadge(course.type)}</TableCell>
                <TableCell>{getAccessibilityBadge(course.accessibility)}</TableCell>
                <TableCell>
                  {course.jobId && (
                    <CourseProgress
                      progress={progress}
                      className="max-w-xs"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <IconButton
                      icon={<EyeRoundIcon />}
                      size="sm"
                      appearance="subtle"
                      style={{ color: 'green' }}
                      onClick={() => {
                        toast({
                          title: 'Coming Soon',
                          description: 'Course preview will be available soon!',
                        });
                      }}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      appearance="subtle"
                      style={{ color: 'blue' }}
                      onClick={() => handleEdit(course)}
                    />
                    <IconButton
                      icon={<TrashIcon />}
                      size="sm"
                      appearance="ghost"
                      style={{ color: 'red' }}
                      onClick={() => setCourseToDelete(course)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateCourseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={onCourseChange}
      />

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && handleDelete(courseToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getAccessibilityBadge(accessibility: Course['accessibility']) {
  const variants = {
    free: 'success',
    paid: 'default',
    limited: 'warning',
  };
  return (
    <Badge variant={variants[accessibility] as any}>
      {accessibility.charAt(0).toUpperCase() + accessibility.slice(1)}
    </Badge>
  );
}

function getTypeBadge(type: Course['type']) {
  return (
    <Badge variant="outline">
      {type === 'image_theory' ? 'Image & Theory' : 'Video & Theory'}
    </Badge>
  );
}