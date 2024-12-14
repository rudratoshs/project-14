import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import EditButton from './EditButton';
import EditDialog from './EditDialog';

interface ContentEditorProps {
  title: string;
  content?: string;
  thumbnail?: string;
  banner?: string;
  onSave: (data: { title: string; content?: string; thumbnail?: string; banner?: string }) => Promise<void>;
  type: 'course' | 'topic' | 'subtopic';
}

export default function ContentEditor({
  title,
  content,
  thumbnail,
  banner,
  onSave,
  type
}: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (data: { title: string; content?: string; thumbnail?: string; banner?: string }) => {
    try {
      setIsSaving(true);
      await onSave(data);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: `${type} updated successfully`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update ${type}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <EditButton onClick={() => setIsEditing(true)} />
      <EditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        title={title}
        content={content}
        thumbnail={thumbnail}
        banner={banner}
        onSave={handleSave}
        type={type}
        isSaving={isSaving}
      />
    </>
  );
}