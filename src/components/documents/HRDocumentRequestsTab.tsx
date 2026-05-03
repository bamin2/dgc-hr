import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useAllHRDocumentRequests,
  useUpdateHRDocumentRequest,
  HRDocumentRequest,
} from "@/hooks/useHRDocumentRequests";
import { getCategoryLabel } from "./TemplateCategoryBadge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Download,
  FileCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export function HRDocumentRequestsTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<HRDocumentRequest | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const { data: requests, isLoading } = useAllHRDocumentRequests(statusFilter);
  const updateRequest = useUpdateHRDocumentRequest();

  const handleApproveAndGenerate = async (request: HRDocumentRequest) => {
    if (!request.template?.docx_storage_path) {
      toast.error("No DOCX template configured for this document type");
      return;
    }

    setGeneratingId(request.id);
    try {
      // Call edge function to generate the document
      const { data, error } = await supabase.functions.invoke("generate-hr-letter", {
        body: { request_id: request.id },
      });

      if (error) throw error;

      toast.success("Document generated successfully");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate document");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleReject = (request: HRDocumentRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;

    try {
      await updateRequest.mutateAsync({
        id: selectedRequest.id,
        status: "rejected",
        rejection_reason: rejectionReason || undefined,
      });
      toast.success("Request rejected");
      setRejectDialogOpen(false);
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleDownload = async (request: HRDocumentRequest) => {
    if (!request.pdf_storage_path) {
      toast.error("No document available for download");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("hr-letters")
        .download(request.pdf_storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${request.template?.name || "document"}_${request.employee?.first_name}_${request.employee?.last_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-full">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No requests found</h3>
            <p className="text-muted-foreground mt-1">
              {statusFilter === "pending"
                ? "No pending HR document requests"
                : `No ${statusFilter} requests`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {request.employee?.first_name?.[0]}
                        {request.employee?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {request.employee?.first_name} {request.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.employee?.employee_code || request.employee?.email}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{request.template?.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(request.template?.category || "")}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    Requested {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>

                {request.notes && (
                  <div className="text-sm bg-muted/50 rounded-md p-3">
                    <p className="text-muted-foreground">
                      <strong>Notes:</strong> {request.notes}
                    </p>
                  </div>
                )}

                {request.rejection_reason && (
                  <div className="text-sm bg-red-50 text-red-700 rounded-md p-3">
                    <p>
                      <strong>Rejection reason:</strong> {request.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {request.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(request)}
                      disabled={updateRequest.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveAndGenerate(request)}
                      disabled={generatingId === request.id || !request.template?.docx_storage_path}
                    >
                      {generatingId === request.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-4 w-4 mr-1" />
                          Approve & Generate
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {request.status === "approved" && request.pdf_storage_path && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(request)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this document request. The employee will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={updateRequest.isPending}
            >
              {updateRequest.isPending ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
