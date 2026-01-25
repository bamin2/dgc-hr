import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  FileIcon,
  Inbox
} from 'lucide-react';
import { useMyDocuments } from '@/hooks/useMyDocuments';
import { useGetDocumentUrl } from '@/hooks/useEmployeeDocuments';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MyProfilePayslipsSection } from './MyProfilePayslipsSection';
import { MyProfileHRLettersSection } from './MyProfileHRLettersSection';
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';

interface MyProfileDocumentsTabProps {
  employeeId: string;
}

export function MyProfileDocumentsTab({ employeeId }: MyProfileDocumentsTabProps) {
  const { data: documents, isLoading } = useMyDocuments(employeeId);
  const getDocumentUrl = useGetDocumentUrl();

  const visibleDocuments = documents || [];

  const handleView = async (fileUrl: string) => {
    try {
      const signedUrl = await getDocumentUrl.mutateAsync(fileUrl);
      window.open(signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to open document');
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const signedUrl = await getDocumentUrl.mutateAsync(fileUrl);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  if (isLoading) {
    return (
      <BentoGrid noPadding>
        {[1, 2, 3].map((i) => (
          <BentoCard key={i} colSpan={i === 1 ? 12 : 6}>
            <Skeleton className="h-24 w-full" />
          </BentoCard>
        ))}
      </BentoGrid>
    );
  }

  const hasDocuments = visibleDocuments.length > 0;

  // Group documents by type
  const documentsByType = visibleDocuments.reduce((acc, doc) => {
    const type = (doc.document_type as { name: string })?.name || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, typeof visibleDocuments>);

  return (
    <BentoGrid noPadding>
      {/* Documents Section */}
      <BentoCard colSpan={12}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-base font-medium">Documents</h3>
        </div>
        
        {!hasDocuments ? (
          <div className="py-6 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-muted-foreground">
              No Documents Available
            </h4>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Documents shared with you will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(documentsByType).map(([type, docs]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{type}</h4>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-background rounded-lg">
                          <FileIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {doc.document_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : 'N/A'}
                            </span>
                            {doc.file_size && (
                              <>
                                <span>•</span>
                                <span>
                                  {(doc.file_size / 1024).toFixed(1)} KB
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleView(doc.file_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownload(doc.file_url, doc.file_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoCard>

      {/* HR Letters Section */}
      <BentoCard colSpan={6} noPadding>
        <MyProfileHRLettersSection employeeId={employeeId} noBorder />
      </BentoCard>

      {/* Payslips Section */}
      <BentoCard colSpan={6} noPadding>
        <MyProfilePayslipsSection employeeId={employeeId} noBorder />
      </BentoCard>
    </BentoGrid>
  );
}
