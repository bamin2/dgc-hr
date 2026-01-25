import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useMyDocuments } from '@/hooks/useMyDocuments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Eye, Download, Loader2, Calendar, AlertCircle } from 'lucide-react';

interface MobileDocumentsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export function MobileDocumentsSheet({
  open,
  onOpenChange,
  employeeId,
}: MobileDocumentsSheetProps) {
  const { data: documents, isLoading } = useMyDocuments(employeeId);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleView = async (fileUrl: string, fileName: string) => {
    try {
      setLoadingId(fileUrl);
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(fileUrl, 300);

      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('Failed to open document');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      setLoadingId(fileUrl + '-download');
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Document downloaded');
    } catch {
      toast.error('Failed to download document');
    } finally {
      setLoadingId(null);
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pr-12">
          <DrawerTitle>My Documents</DrawerTitle>
        </DrawerHeader>
        
        <DrawerBody>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !documents?.length ? (
            <EmptyState
              icon={FileText}
              title="No documents"
              description="You don't have any documents available yet."
              size="sm"
            />
          ) : (
            <div className="space-y-3 pb-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.document_type?.name || 'Document'}
                      </p>
                      
                      {doc.expiry_date && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {isExpired(doc.expiry_date) ? (
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Expired {format(new Date(doc.expiry_date), 'MMM d, yyyy')}
                            </span>
                          ) : isExpiringSoon(doc.expiry_date) ? (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Expires {format(new Date(doc.expiry_date), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires {format(new Date(doc.expiry_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10"
                      onClick={() => handleView(doc.file_url, doc.file_name)}
                      disabled={loadingId === doc.file_url}
                    >
                      {loadingId === doc.file_url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10"
                      onClick={() => handleDownload(doc.file_url, doc.file_name)}
                      disabled={loadingId === doc.file_url + '-download'}
                    >
                      {loadingId === doc.file_url + '-download' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
