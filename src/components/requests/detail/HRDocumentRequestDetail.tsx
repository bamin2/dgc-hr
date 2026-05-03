import { format } from "date-fns";
import { FileText, Clock, CheckCircle, XCircle, Download, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HRDocumentRequest } from "@/hooks/useHRDocumentRequests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HRDocumentRequestDetailSheetProps {
  request: HRDocumentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-muted text-muted-foreground border-border" },
} as const;

export function HRDocumentRequestDetailSheet({
  request,
  open,
  onOpenChange,
}: HRDocumentRequestDetailSheetProps) {
  if (!request) return null;

  const status = statusConfig[request.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;

  const handleDownload = async () => {
    if (!request.pdf_storage_path) {
      toast.error("Document is not available yet");
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from("hr-documents")
        .createSignedUrl(request.pdf_storage_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast.error("Could not open document");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] rounded-t-xl p-0"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            HR Document Request
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="py-5">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-medium">
                  {request.template?.name || "HR Document"}
                </h3>
                {request.template?.category && (
                  <p className="text-sm text-muted-foreground capitalize mt-0.5">
                    {request.template.category}
                  </p>
                )}
              </div>
              <Badge variant="outline" className={status.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="rounded-xl bg-white/60 dark:bg-white/5 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {request.processed_at && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Processed</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.processed_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {request.notes && (
              <div className="rounded-xl bg-white/60 dark:bg-white/5 p-4">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {request.notes}
                </p>
              </div>
            )}

            {request.status === "rejected" && request.rejection_reason && (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Rejection Reason
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {request.rejection_reason}
                </p>
              </div>
            )}

            {request.status === "approved" && request.pdf_storage_path && (
              <Button onClick={handleDownload} className="w-full min-h-[48px]">
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
