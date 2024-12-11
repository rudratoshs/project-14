import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
  label?: string;
}

export default function EditButton({ onClick, label = '' }: EditButtonProps) {
  return (
    <Button
      variant="outlineEdit"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 h-[40px]"
    >
      <Edit2 className="h-4 w-4" />
      {label}
    </Button>
  );
}