import { format } from "date-fns";
import { useMyRequests } from "@/hooks/useApprovalSteps";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, FileText } from "lucide-react";
import { ApprovalProgressSteps } from "./ApprovalProgressSteps";

export function MyRequestsTab() {
  const { data: requests, isLoading } = useMyRequests();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No requests yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You haven't submitted any requests. When you do, they'll appear here.
        </p>
      </div>
    );
  }

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

  return (
    <div className="space-y-4">
      {requests.map((request) => (
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
    </div>
  );
}
