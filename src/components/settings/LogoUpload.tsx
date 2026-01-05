import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { ImageCropper } from '@/components/ui/image-cropper';

interface LogoUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LogoUpload = ({ 
  value, 
  onChange, 
  label = 'Upload Logo',
  fallback = 'FT',
  size = 'lg'
}: LogoUploadProps) => {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setSelectedImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={value} alt="Logo preview" />
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
            {value && value !== '/placeholder.svg' && value !== '' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB. Square format recommended.</p>
        </div>
      </div>

      <ImageCropper
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        cropShape="rect"
      />
    </>
  );
};
