import { Dialog } from '@/components/ui/dialog';
import CourseWizard from './wizard/CourseWizard';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCourseDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CourseWizard
        open={open}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}