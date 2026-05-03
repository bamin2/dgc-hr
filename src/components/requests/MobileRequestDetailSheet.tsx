import { LeaveRequestDetailDialog } from "@/components/timeoff/LeaveRequestDetailDialog";
import { LoanDetailSheet } from "@/components/loans/LoanDetailSheet";
import { BusinessTripDetailSheet } from "./detail/BusinessTripDetailSheet";
import { HRDocumentRequestDetailSheet } from "./detail/HRDocumentRequestDetail";
import { UnifiedRequest } from "@/hooks/useUnifiedRequests";
import { LeaveRequest } from "@/hooks/useLeaveRequests";
import { HRDocumentRequest } from "@/hooks/useHRDocumentRequests";
import { useRole } from "@/contexts/RoleContext";

interface MobileRequestDetailSheetProps {
  request: UnifiedRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Routes a unified request to the correct detail surface for mobile.
 * Reuses the existing per-domain detail components so behavior stays
 * consistent with the rest of the app.
 */
export function MobileRequestDetailSheet({
  request,
  open,
  onOpenChange,
}: MobileRequestDetailSheetProps) {
  const { hasRole } = useRole();
  const isPrivileged = hasRole("hr") || hasRole("admin");

  if (!request) return null;

  switch (request.type) {
    case "leave":
      return (
        <LeaveRequestDetailDialog
          request={request.metadata as LeaveRequest}
          open={open}
          onOpenChange={onOpenChange}
        />
      );

    case "loan":
      return (
        <LoanDetailSheet
          loanId={request.id}
          open={open}
          onOpenChange={onOpenChange}
          readOnly={!isPrivileged}
        />
      );

    case "business_trip":
      return (
        <BusinessTripDetailSheet
          tripId={request.id}
          open={open}
          onOpenChange={onOpenChange}
        />
      );

    case "hr_document":
      return (
        <HRDocumentRequestDetailSheet
          request={request.metadata as HRDocumentRequest}
          open={open}
          onOpenChange={onOpenChange}
        />
      );

    default:
      return null;
  }
}
