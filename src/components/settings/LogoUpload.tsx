import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { resizeImage } from '@/utils/cropImage';

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (including SVG)
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG, JPG, SVG, or WebP)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Handle SVG files - upload directly without processing
      if (file.type === 'image/svg+xml') {
        setIsUploading(true);
        try {
          await uploadLogo(file, false, true);
        } catch (error) {
          console.error('Error uploading SVG:', error);
          toast.error('Failed to upload SVG');
        } finally {
          setIsUploading(false);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Detect if original file is PNG (for transparency preservation)
      const isPngFile = file.type === 'image/png';
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (result) {
          setIsUploading(true);
          try {
            // Resize the full image to fit within 400x400, preserving PNG transparency
            const { blob: resizedBlob, isPng } = await resizeImage(result, 400, isPngFile);
            await uploadLogo(resizedBlob, isPng);
          } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image');
          } finally {
            setIsUploading(false);
          }
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadLogo = async (imageBlob: Blob, isPng: boolean, isSvg: boolean = false) => {
    try {
      // Generate unique filename with correct extension
      let extension = 'jpg';
      let contentType = 'image/jpeg';
      
      if (isSvg) {
        extension = 'svg';
        contentType = 'image/svg+xml';
      } else if (isPng) {
        extension = 'png';
        contentType = 'image/png';
      }
      
      const fileName = `company/logo-${Date.now()}.${extension}`;
      
      // Delete old logo if it exists in our bucket
      if (value && value.includes('avatars')) {
        const oldPath = value.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }
      
      // Upload to Supabase Storage with correct content type
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, imageBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType,
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update settings with the URL
      onChange(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleRemove = async () => {
    // Delete from storage if it's our bucket
    if (value && value.includes('avatars')) {
      const path = value.split('/avatars/')[1];
      if (path) {
        await supabase.storage.from('avatars').remove([path]);
      }
    }
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
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <label className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : label}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </Button>
            {value && value !== '/placeholder.svg' && value !== '' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG, or SVG up to 5MB. SVG recommended for best quality.</p>
        </div>
      </div>
    </>
  );
};
