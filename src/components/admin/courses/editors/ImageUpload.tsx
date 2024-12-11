import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()} URL`}
      />
      {value && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.classList.add('hidden');
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            value && "hidden"
          )}>
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}