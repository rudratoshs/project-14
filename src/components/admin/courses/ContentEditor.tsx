import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Edit2, Image as ImageIcon, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentEditorProps {
  title: string;
  content?: string;
  thumbnail?: string;
  banner?: string;
  onSave: (data: { title: string; content?: string; thumbnail?: string; banner?: string }) => Promise<void>;
  type: 'course' | 'topic' | 'subtopic';
}

export default function ContentEditor({ title: initialTitle, content: initialContent, thumbnail: initialThumbnail, banner: initialBanner, onSave, type }: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent || '');
  const [thumbnail, setThumbnail] = useState(initialThumbnail || '');
  const [banner, setBanner] = useState(initialBanner || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({ title, content, thumbnail, banner });
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update content',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{type.charAt(0).toUpperCase() + type.slice(1)} Content</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit Content
        </Button>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {type.charAt(0).toUpperCase() + type.slice(1)} Content</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${type} title`}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Enter ${type} content`}
                className="min-h-[200px]"
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              {/* Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <div className="space-y-2">
                  <Input
                    id="thumbnail"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="Enter thumbnail URL"
                  />
                  {thumbnail && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.classList.add('hidden');
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        thumbnail && "hidden"
                      )}>
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label htmlFor="banner">Banner URL</Label>
                <div className="space-y-2">
                  <Input
                    id="banner"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                    placeholder="Enter banner URL"
                  />
                  {banner && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={banner}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.classList.add('hidden');
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        banner && "hidden"
                      )}>
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
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
    </>
  );
}