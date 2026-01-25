import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Inbox
} from 'lucide-react';
import { useMyHRLetters } from '@/hooks/useMyHRLetters';
import { useGetHRLetterUrl } from '@/hooks/useHRDocumentRequests';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MyProfileHRLettersSectionProps {
  employeeId: string;
  noBorder?: boolean;
}

export function MyProfileHRLettersSection({ employeeId, noBorder = false }: MyProfileHRLettersSectionProps) {
  const { data: letters, isLoading } = useMyHRLetters(employeeId);
  const getLetterUrl = useGetHRLetterUrl();

  const handleView = async (storagePath: string) => {
    try {
      const signedUrl = await getLetterUrl.mutateAsync(storagePath);
      window.open(signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to open letter');
    }
  };

  const handleDownload = async (storagePath: string, templateName: string) => {
    try {
      const signedUrl = await getLetterUrl.mutateAsync(storagePath);
      
      // Fetch the PDF as a blob to force download
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${templateName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error('Failed to download letter');
    }
  };

  const content = (
    <>
      <div className={`flex items-center gap-2 ${noBorder ? 'p-5 pb-3' : ''}`}>
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-base font-medium">HR Letters</h3>
      </div>
      <div className={noBorder ? 'px-5 pb-5' : ''}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !letters || letters.length === 0 ? (
          <div className="py-6 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No HR letters yet. Request one from your dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-background rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {letter.template?.name || 'HR Letter'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {letter.processed_at 
                          ? format(new Date(letter.processed_at), 'MMM d, yyyy')
                          : format(new Date(letter.created_at), 'MMM d, yyyy')
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleView(letter.pdf_storage_path)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(letter.pdf_storage_path, letter.template?.name || 'HR Letter')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (noBorder) {
    return <div>{content}</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          HR Letters
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !letters || letters.length === 0 ? (
          <div className="py-6 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No HR letters yet. Request one from your dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-background rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {letter.template?.name || 'HR Letter'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {letter.processed_at 
                          ? format(new Date(letter.processed_at), 'MMM d, yyyy')
                          : format(new Date(letter.created_at), 'MMM d, yyyy')
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleView(letter.pdf_storage_path)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(letter.pdf_storage_path, letter.template?.name || 'HR Letter')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
