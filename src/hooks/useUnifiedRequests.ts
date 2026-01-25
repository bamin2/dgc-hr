import { useMemo } from "react";
import { useMyRequests } from "@/hooks/useApprovalSteps";
import { useMyBusinessTrips } from "@/hooks/useBusinessTrips";
import { useMyHRDocumentRequests } from "@/hooks/useHRDocumentRequests";
import { useMyLoans } from "@/hooks/useLoans";
import { format } from "date-fns";

export type RequestType = "leave" | "business_trip" | "hr_document" | "loan";
export type UnifiedStatus = "pending" | "approved" | "rejected" | "cancelled" | "active" | "draft";

export interface UnifiedRequest {
  id: string;
  type: RequestType;
  title: string;
  subtitle: string;
  status: UnifiedStatus;
  createdAt: string;
  icon: string; // leave type color or icon identifier
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}

// Map various statuses to unified status
function normalizeStatus(status: string): UnifiedStatus {
  const statusMap: Record<string, UnifiedStatus> = {
    // Pending states
    pending: "pending",
    requested: "pending",
    submitted: "pending",
    draft: "draft",
    pending_manager: "pending",
    pending_hr: "pending",
    
    // Approved states
    approved: "approved",
    hr_approved: "approved",
    manager_approved: "approved",
    active: "active",
    
    // Rejected states
    rejected: "rejected",
    
    // Cancelled states
    cancelled: "cancelled",
    closed: "cancelled",
  };
  
  return statusMap[status.toLowerCase()] || "pending";
}

export function useUnifiedRequests(statusFilter?: string) {
  const { data: leaveRequests, isLoading: requestsLoading } = useMyRequests();
  const { data: businessTrips, isLoading: tripsLoading } = useMyBusinessTrips();
  const { data: hrDocRequests, isLoading: hrDocsLoading } = useMyHRDocumentRequests();
  const { data: loans, isLoading: loansLoading } = useMyLoans();

  const isLoading = requestsLoading || tripsLoading || hrDocsLoading || loansLoading;

  const requests = useMemo(() => {
    const unified: UnifiedRequest[] = [];

    // Transform leave requests
    if (leaveRequests) {
      leaveRequests.forEach((req) => {
        const startDate = new Date(req.start_date);
        const endDate = new Date(req.end_date);
        const sameDay = req.start_date === req.end_date;
        
        unified.push({
          id: req.id,
          type: "leave",
          title: req.leave_type?.name || "Leave Request",
          subtitle: sameDay 
            ? format(startDate, "MMM d") 
            : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")} · ${req.days_count} days`,
          status: normalizeStatus(req.status),
          createdAt: req.created_at,
          icon: req.leave_type?.color || "#6366f1",
          metadata: req,
        });
      });
    }

    // Transform business trips
    if (businessTrips) {
      businessTrips.forEach((trip) => {
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        
        unified.push({
          id: trip.id,
          type: "business_trip",
          title: trip.destination?.name || "Business Trip",
          subtitle: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`,
          status: normalizeStatus(trip.status),
          createdAt: trip.created_at || new Date().toISOString(),
          icon: "plane",
          metadata: trip,
        });
      });
    }

    // Transform HR document requests
    if (hrDocRequests) {
      hrDocRequests.forEach((req) => {
        unified.push({
          id: req.id,
          type: "hr_document",
          title: req.template?.name || "HR Document",
          subtitle: `Requested ${format(new Date(req.created_at), "MMM d")}`,
          status: normalizeStatus(req.status),
          createdAt: req.created_at,
          icon: "file-text",
          metadata: req,
        });
      });
    }

    // Transform loans
    if (loans) {
      loans.forEach((loan) => {
        const amount = loan.principal_amount?.toLocaleString() || "0";
        
        unified.push({
          id: loan.id,
          type: "loan",
          title: `Loan · SAR ${amount}`,
          subtitle: loan.start_date 
            ? `Starting ${format(new Date(loan.start_date), "MMM d, yyyy")}`
            : "Pending approval",
          status: normalizeStatus(loan.status),
          createdAt: loan.created_at,
          icon: "banknote",
          metadata: loan,
        });
      });
    }

    // Sort by createdAt descending
    unified.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      return unified.filter((req) => req.status === statusFilter);
    }

    return unified;
  }, [leaveRequests, businessTrips, hrDocRequests, loans, statusFilter]);

  return {
    data: requests,
    isLoading,
  };
}
