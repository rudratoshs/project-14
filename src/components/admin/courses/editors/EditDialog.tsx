import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import ContentForm from './ContentForm';

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content?: string;
  thumbnail?: string;
  banner?: string;
  onSave: (data: { title: string; content?: string; thumbnail?: string; banner?: string }) => Promise<void>;
  type: 'course' | 'topic' | 'subtopic';
  isSaving: boolean;
}

export default function EditDialog({
  open,
  onOpenChange,
  title: initialTitle,
  content: initialContent = '',
  thumbnail: initialThumbnail = '',
  banner: initialBanner = '',
  onSave,
  type,
  isSaving
}: EditDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [thumbnail, setThumbnail] = useState(initialThumbnail);
  const [banner, setBanner] = useState(initialBanner);

  const handleSave = () => {
    onSave({ title, content, thumbnail, banner });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ContentForm
            title={title}
            content={content}
            thumbnail={thumbnail}
            banner={banner}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onThumbnailChange={setThumbnail}
            onBannerChange={setBanner}
            type={type}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}