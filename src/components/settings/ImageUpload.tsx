import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';

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
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={value} alt="Preview" />
        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {label}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </Button>
          {value && value !== '/placeholder.svg' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onChange('/placeholder.svg')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
      </div>
    </div>
  );
};
