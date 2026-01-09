import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  editable?: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

export function EditableField({
  label,
  value,
  onSave,
  editable = true,
  multiline = false,
  placeholder,
  className,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded",
          editable 
            ? "bg-primary/10 text-primary" 
            : "bg-muted text-muted-foreground"
        )}>
          {editable ? 'Editable' : 'Read-only'}
        </span>
      </div>
      
      {isEditing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[80px] text-sm"
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="text-sm"
              autoFocus
            />
          )}
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 w-9 shrink-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-9 w-9 shrink-0"
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 min-h-[40px] p-2.5 bg-muted/50 rounded-md">
          <span className={cn(
            "text-sm",
            value ? "text-foreground" : "text-muted-foreground"
          )}>
            {value || placeholder || 'Not set'}
          </span>
          {editable && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-7 w-7 shrink-0"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}