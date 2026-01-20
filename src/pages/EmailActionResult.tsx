import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

type ResultType = "success" | "error" | "expired" | "rejected" | "info";

const EmailActionResult = () => {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") || "info";
  const title = searchParams.get("title") || "Action Processed";
  const message = searchParams.get("message") || "";
  const type = (searchParams.get("type") as ResultType) || "info";

  // Request details
  const employeeName = searchParams.get("employeeName");
  const leaveType = searchParams.get("leaveType");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const daysCount = searchParams.get("daysCount");
  const rejectionReason = searchParams.get("rejectionReason");

  const hasDetails = employeeName || leaveType || startDate;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-emerald-500" />;
      case "rejected":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "expired":
        return <Clock className="h-16 w-16 text-amber-500" />;
      case "error":
        return <AlertTriangle className="h-16 w-16 text-red-500" />;
      default:
        return <CheckCircle className="h-16 w-16 text-primary" />;
    }
  };

  const getBackgroundStyle = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-br from-emerald-50 to-emerald-100";
      case "rejected":
        return "bg-gradient-to-br from-red-50 to-red-100";
      case "expired":
        return "bg-gradient-to-br from-amber-50 to-amber-100";
      case "error":
        return "bg-gradient-to-br from-red-50 to-red-100";
      default:
        return "bg-gradient-to-br from-primary/5 to-primary/10";
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className={`text-center rounded-t-lg ${getBackgroundStyle()}`}>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {message && (
            <p className="text-center text-muted-foreground">
              {message}
            </p>
          )}

          {hasDetails && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {employeeName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee</span>
                  <span className="font-medium">{employeeName}</span>
                </div>
              )}
              {leaveType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leave Type</span>
                  <span className="font-medium">{leaveType}</span>
                </div>
              )}
              {startDate && endDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </span>
                </div>
              )}
              {daysCount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days</span>
                  <span className="font-medium">{daysCount}</span>
                </div>
              )}
              {rejectionReason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Rejection Reason</span>
                  <p className="mt-1 text-sm font-medium">{rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <Button asChild>
              <Link to="/">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailActionResult;
