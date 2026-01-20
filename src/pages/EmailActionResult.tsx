import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type ResultType = "success" | "error" | "expired" | "rejected" | "info" | "reject-form";

const EmailActionResult = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const status = searchParams.get("status") || "info";
  const title = searchParams.get("title") || "Action Processed";
  const message = searchParams.get("message") || "";
  const type = (searchParams.get("type") as ResultType) || "info";
  const token = searchParams.get("token") || "";

  // Request details
  const employeeName = searchParams.get("employeeName");
  const leaveType = searchParams.get("leaveType");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const daysCount = searchParams.get("daysCount");
  const rejectionReason = searchParams.get("rejectionReason");

  // Rejection form state
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionComplete, setRejectionComplete] = useState(false);
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const hasDetails = employeeName || leaveType || startDate;

  const handleRejectSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setRejectionError(null);

    try {
      const response = await fetch(
        `https://dzohlljggpxmitgwzcwc.supabase.co/functions/v1/handle-email-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, reason: reason.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setRejectionComplete(true);
      } else {
        setRejectionError(data.message || "Failed to reject the request.");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      setRejectionError("An error occurred while processing the rejection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    if (type === "reject-form" && !rejectionComplete) {
      return <XCircle className="h-16 w-16 text-amber-500" />;
    }
    switch (type) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-emerald-500" />;
      case "rejected":
      case "reject-form":
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
    if (type === "reject-form" && !rejectionComplete) {
      return "bg-gradient-to-br from-amber-50 to-amber-100";
    }
    switch (type) {
      case "success":
        return "bg-gradient-to-br from-emerald-50 to-emerald-100";
      case "rejected":
      case "reject-form":
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

  const getTitle = () => {
    if (type === "reject-form") {
      return rejectionComplete ? "Request Rejected" : "Reject Leave Request";
    }
    return title;
  };

  // Render rejection form
  if (type === "reject-form" && !rejectionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className={`text-center rounded-t-lg ${getBackgroundStyle()}`}>
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {getTitle()}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
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
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {rejectionError && (
              <p className="text-sm text-destructive text-center">{rejectionError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                asChild
                disabled={isSubmitting}
              >
                <Link to="/">Cancel</Link>
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleRejectSubmit}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Request"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render result page (approval success, rejection complete, errors, etc.)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className={`text-center rounded-t-lg ${getBackgroundStyle()}`}>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {getTitle()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {message && (
            <p className="text-center text-muted-foreground">
              {rejectionComplete ? "The leave request has been rejected." : message}
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
              {(rejectionReason || (rejectionComplete && reason)) && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Rejection Reason</span>
                  <p className="mt-1 text-sm font-medium">{rejectionReason || reason}</p>
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
