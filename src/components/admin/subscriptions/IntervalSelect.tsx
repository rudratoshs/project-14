import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  
  interface IntervalSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }
  
  export function IntervalSelect({ value, onChange, disabled }: IntervalSelectProps) {
    return (
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select billing interval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MONTHLY">Monthly</SelectItem>
          <SelectItem value="YEARLY">Yearly</SelectItem>
        </SelectContent>
      </Select>
    );
  }