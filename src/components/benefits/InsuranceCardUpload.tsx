import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileImage, ExternalLink, Loader2 } from 'lucide-react';
import { useInsuranceCardUpload } from '@/hooks/useInsuranceCardUpload';
import { useToast } from '@/hooks/use-toast';

interface InsuranceCardUploadProps {
  label: string;
  currentUrl?: string | null;
  enrollmentId: string;
  beneficiaryId?: string;
  onUploadComplete: (url: string) => void;
}

export const InsuranceCardUpload = ({
  label,
  currentUrl,
  enrollmentId,
  beneficiaryId,
  onUploadComplete,
}: InsuranceCardUploadProps) => {
  const { uploadCard, isUploading } = useInsuranceCardUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image (JPG, PNG, WebP) or PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = await uploadCard(file, enrollmentId, beneficiaryId);
      setPreviewUrl(url);
      onUploadComplete(url);
      toast({
        title: 'Card uploaded',
        description: 'Insurance card has been saved successfully.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload insurance card. Please try again.',
        variant: 'destructive',
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 min-w-0">
        <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {displayUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => window.open(displayUrl, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Button
          variant={displayUrl ? 'outline' : 'default'}
          size="sm"
          className="h-8"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {displayUrl ? 'Replace' : 'Upload'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
