import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleImageUpload } from '@/lib/api/courses';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  size: 'thumbnail' | 'banner';
  courseId: string;
}

export default function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const imageUrl = await handleImageUpload(file);
      onChange(imageUrl); // Update the parent state with the uploaded image URL for immediate preview
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()} URL`}
      />
      <div className="flex items-center justify-between mt-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id={`${label}-file-input`}
        />
        <label htmlFor={`${label}-file-input`} className="flex items-center gap-2 cursor-pointer">
          <UploadCloud className="h-6 w-6 text-gray-500" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </label>
      </div>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mt-2">
        <img
          src={value}
          alt={label}
          className={cn(
            'w-full h-full object-cover' 
          )}
        />
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            value && 'hidden' // Hide the placeholder when the value exists
          )}
        >
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
  );
}