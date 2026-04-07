import { useCallback, useState } from 'react';
import { Upload, X, FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  required?: boolean;
  className?: string;
}

export function FileDropzone({ files, onFilesChange, required, className }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        continue; // silently skip oversized
      }
      validFiles.push(file);
    }
    onFilesChange([...files, ...validFiles]);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleBrowse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = ACCEPTED_TYPES.join(',');
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.length) addFiles(target.files);
    };
    input.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-primary/30 hover:border-primary/50',
        )}
        onClick={handleBrowse}
      >
        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-medium">
          {isDragOver ? 'Drop files here' : 'Drag & Drop your files'}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          Maximum file size allowed is 20MB
          {required && <span className="text-destructive ml-1">*</span>}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleBrowse(); }}>
          <Upload className="w-4 h-4 mr-2" />
          Browse files
        </Button>
      </div>

      {files.length > 0 ? (
        <div className="space-y-1">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate flex-1">{file.name}</span>
              <span className="text-muted-foreground text-xs shrink-0">{formatSize(file.size)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeFile(i)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="w-4 h-4" />
          <span>No file added{required ? ' (required)' : ''}</span>
        </div>
      )}
    </div>
  );
}
