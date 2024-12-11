import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export default function ImagePreview({ src, alt }: ImagePreviewProps) {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = '';
          e.currentTarget.classList.add('hidden');
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className={cn(
        "absolute inset-0 flex items-center justify-center",
        src && "hidden"
      )}>
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    </div>
  );
}