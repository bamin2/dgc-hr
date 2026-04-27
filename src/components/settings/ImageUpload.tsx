import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  label = 'Upload Image',
  fallback = 'FT',
  size = 'md'
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28'
  };

  const processFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload image by clicking or dragging a file"
      className={cn(
        'flex items-center gap-4 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      )}
    >
      <Avatar className={cn(sizeClasses[size], 'pointer-events-none')}>
        <AvatarImage src={value} alt="Preview" />
        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            <Upload className="h-4 w-4 mr-2" />
            {label}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {value && value !== '/placeholder.svg' && (
            <Button 
              variant="ghost" 
              size="sm"
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange('/placeholder.svg'); }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isDragging ? 'Drop image to upload' : 'Drag & drop or click. PNG, JPG up to 5MB'}
        </p>
      </div>
    </div>
  );
};
