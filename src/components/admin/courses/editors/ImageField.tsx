import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ImagePreview from './ImagePreview';

interface ImageFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ImageField({ id, label, value, onChange, placeholder }: ImageFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="space-y-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {value && <ImagePreview src={value} alt={label} />}
      </div>
    </div>
  );
}