import { format } from "date-fns";
import { useMyRequests } from "@/hooks/useApprovalSteps";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, FileText, Download, Eye, Loader2 } from "lucide-react";
import { ApprovalProgressSteps } from "./ApprovalProgressSteps";
import { NewRequestDropdown } from "./NewRequestDropdown";
import { useMyHRDocumentRequests, useGetHRLetterUrl } from "@/hooks/useHRDocumentRequests";
import { toast } from "sonner";
import { useState } from "react";

export function MyRequestsTab() {
  const { data: requests, isLoading } = useMyRequests();
  const { data: hrDocRequests, isLoading: hrDocLoading } = useMyHRDocumentRequests();
  const getLetterUrl = useGetHRLetterUrl();
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const isLoadingAll = isLoading || hrDocLoading;

  const handleViewPdf = async (storagePath: string, requestId: string) => {
    setLoadingPdf(requestId);
    try {
      const signedUrl = await getLetterUrl.mutateAsync(storagePath);
      window.open(signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to open document');
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleDownloadPdf = async (storagePath: string, templateName: string, requestId: string) => {
    setLoadingPdf(requestId);
    try {
      const signedUrl = await getLetterUrl.mutateAsync(storagePath);
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = `${templateName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download document');
    } finally {
      setLoadingPdf(null);
    }
  };
  
  // Filter out public holidays from leave requests
  const filteredRequests = requests?.filter(
    (request) => request.leave_type?.name !== "Public Holiday"
  );
  
  const hasNoRequests = (!filteredRequests || filteredRequests.length === 0) && (!hrDocRequests || hrDocRequests.length === 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoadingAll) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <NewRequestDropdown />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (hasNoRequests) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <NewRequestDropdown />
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No requests yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You haven't submitted any requests. When you do, they'll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewRequestDropdown />
      </div>

      {/* Leave Requests - excluding public holidays */}
      {filteredRequests?.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: request.leave_type?.color || "#888" }}
                />
                <div>
                  <h3 className="font-medium">{request.leave_type?.name || "Leave"}</h3>
                  <p className="text-xs text-muted-foreground">
                    Submitted {format(new Date(request.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              {getStatusBadge(request.status)}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(request.start_date), "MMM dd")}
                  {request.start_date !== request.end_date && (
                    <> - {format(new Date(request.end_date), "MMM dd")}</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {request.days_count} day{request.days_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {request.approval_steps && request.approval_steps.length > 0 && (
              <ApprovalProgressSteps steps={request.approval_steps} />
            )}

            {request.rejection_reason && (
              <div className="mt-3 p-3 bg-destructive/10 rounded-lg text-sm">
                <p className="font-medium text-destructive">Rejection reason:</p>
                <p className="text-muted-foreground">{request.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* HR Document Requests */}
      {hrDocRequests?.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{request.template?.name || "HR Document"}</h3>
                  <p className="text-xs text-muted-foreground">
                    Submitted {format(new Date(request.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              {getStatusBadge(request.status)}
            </div>

            {request.notes && (
              <p className="text-sm text-muted-foreground mb-3">{request.notes}</p>
            )}

            {/* Download buttons for approved requests with PDF */}
            {request.status === 'approved' && request.pdf_storage_path && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingPdf === request.id}
                  onClick={() => handleViewPdf(request.pdf_storage_path!, request.id)}
                >
                  {loadingPdf === request.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingPdf === request.id}
                  onClick={() => handleDownloadPdf(request.pdf_storage_path!, request.template?.name || 'HR Letter', request.id)}
                >
                  {loadingPdf === request.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  Download
                </Button>
              </div>
            )}

            {request.rejection_reason && (
              <div className="mt-3 p-3 bg-destructive/10 rounded-lg text-sm">
                <p className="font-medium text-destructive">Rejection reason:</p>
                <p className="text-muted-foreground">{request.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
