import { format } from "date-fns";
import { useTeamRequests } from "@/hooks/useApprovalSteps";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users } from "lucide-react";
import { ApprovalProgressSteps } from "./ApprovalProgressSteps";

export function TeamRequestsTab() {
  const { data: requests, isLoading } = useTeamRequests();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No team requests</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your team members haven't submitted any requests yet.
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
      {requests.map((request) => {
        const employee = request.employee;
        return (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee?.avatar_url || undefined} />
                    <AvatarFallback>
                      {employee?.first_name?.[0]}
                      {employee?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: request.leave_type?.color || "#888" }}
                      />
                      <span>{request.leave_type?.name || "Leave"}</span>
                    </div>
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

              {request.reason && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm mb-3">
                  <p className="text-muted-foreground">{request.reason}</p>
                </div>
              )}

              {request.approval_steps && request.approval_steps.length > 0 && (
                <ApprovalProgressSteps steps={request.approval_steps} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
