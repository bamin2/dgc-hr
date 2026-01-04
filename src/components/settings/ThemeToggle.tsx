import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  value: 'light' | 'dark' | 'system';
  onChange: (value: 'light' | 'dark' | 'system') => void;
}

export const ThemeToggle = ({ value, onChange }: ThemeToggleProps) => {
  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ] as const;

  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as 'light' | 'dark' | 'system')}
      className="flex gap-3"
    >
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isSelected = value === theme.value;
        return (
          <Label
            key={theme.value}
            htmlFor={theme.value}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <RadioGroupItem value={theme.value} id={theme.value} className="sr-only" />
            <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
            <span className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-muted-foreground')}>
              {theme.label}
            </span>
          </Label>
        );
      })}
    </RadioGroup>
  );
};
