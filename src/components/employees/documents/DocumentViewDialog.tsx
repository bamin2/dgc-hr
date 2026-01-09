import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmployeeDocument, useGetDocumentUrl } from "@/hooks/useEmployeeDocuments";

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: EmployeeDocument | null;
}

export function DocumentViewDialog({
  open,
  onOpenChange,
  document,
}: DocumentViewDialogProps) {
  const getDocumentUrl = useGetDocumentUrl();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && document) {
      getDocumentUrl.mutateAsync(document.fileUrl).then(setSignedUrl);
    } else {
      setSignedUrl(null);
    }
  }, [open, document?.fileUrl]);

  if (!document) return null;

  const isImage = document.mimeType?.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";

  const handleDownload = () => {
    if (signedUrl) {
      const link = window.document.createElement("a");
      link.href = signedUrl;
      link.download = document.fileName;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.documentName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Document Details */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span className="font-medium">{document.documentTypeName}</span>
            </div>
            {document.documentNumber && (
              <div>
                <span className="text-muted-foreground">Number:</span>{" "}
                <span className="font-medium">{document.documentNumber}</span>
              </div>
            )}
            {document.issueDate && (
              <div>
                <span className="text-muted-foreground">Issue Date:</span>{" "}
                <span className="font-medium">
                  {format(parseISO(document.issueDate), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {document.expiryDate && (
              <div>
                <span className="text-muted-foreground">Expiry Date:</span>{" "}
                <span className="font-medium">
                  {format(parseISO(document.expiryDate), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>

          {document.notes && (
            <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">Notes: </span>
              {document.notes}
            </div>
          )}

          {/* Preview */}
          <div className="border rounded-lg overflow-hidden bg-muted/50 min-h-[300px] flex items-center justify-center">
            {getDocumentUrl.isPending ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading preview...
              </div>
            ) : signedUrl ? (
              isImage ? (
                <img
                  src={signedUrl}
                  alt={document.documentName}
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : isPdf ? (
                <iframe
                  src={signedUrl}
                  className="w-full h-[500px]"
                  title={document.documentName}
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Preview not available for this file type
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={handleOpenInNewTab}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>

        {/* Actions */}
        {signedUrl && (isImage || isPdf) && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
