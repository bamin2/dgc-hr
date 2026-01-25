import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HierarchicalCalendar } from '@/components/ui/hierarchical-calendar';
import { Upload, FileImage, ExternalLink, Loader2, CalendarIcon } from 'lucide-react';
import { useInsuranceCardUpload } from '@/hooks/useInsuranceCardUpload';
import { useToast } from '@/hooks/use-toast';
import { InsuranceCardExpiryBadge } from './InsuranceCardExpiryBadge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface InsuranceCardUploadProps {
  label: string;
  currentUrl?: string | null;
  currentExpiryDate?: string | null;
  enrollmentId: string;
  beneficiaryId?: string;
  onUploadComplete: (url: string, expiryDate?: string) => void;
}

export const InsuranceCardUpload = ({
  label,
  currentUrl,
  currentExpiryDate,
  enrollmentId,
  beneficiaryId,
  onUploadComplete,
}: InsuranceCardUploadProps) => {
  const { uploadCard, isUploading } = useInsuranceCardUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    currentExpiryDate ? parseISO(currentExpiryDate) : undefined
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

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

    // Store file and show expiry picker
    setPendingFile(file);
    setShowExpiryPicker(true);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    try {
      const url = await uploadCard(pendingFile, enrollmentId, beneficiaryId);
      setPreviewUrl(url);
      const expiryStr = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : undefined;
      onUploadComplete(url, expiryStr);
      toast({
        title: 'Card uploaded',
        description: 'Insurance card has been saved successfully.',
      });
      setShowExpiryPicker(false);
      setPendingFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload insurance card. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const displayUrl = previewUrl || currentUrl;
  const displayExpiry = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : currentExpiryDate;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{label}</span>
          {displayExpiry && (
            <InsuranceCardExpiryBadge expiryDate={displayExpiry} />
          )}
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

      {/* Expiry Date Picker Dialog */}
      {showExpiryPicker && pendingFile && (
        <div className="p-3 bg-muted/50 rounded-lg border space-y-3">
          <p className="text-sm font-medium">Set card expiry date (optional)</p>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-48 justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, 'MMM d, yyyy') : 'Select expiry date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <HierarchicalCalendar
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  disabled={(date) => date < new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {expiryDate && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setExpiryDate(undefined)}
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleConfirmUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Confirm Upload'
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowExpiryPicker(false);
                setPendingFile(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
