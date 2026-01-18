import { format } from "date-fns";
import { Eye, MoreHorizontal, CheckCircle, XCircle, Banknote } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { Loan } from "@/hooks/useLoans";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { useIsMobile } from "@/hooks/use-media-query";
import { DataCard, DataCardList } from "@/components/ui/data-card";

interface LoansTableProps {
  loans: Loan[];
  isLoading?: boolean;
  onViewDetails: (loan: Loan) => void;
  onApprove?: (loan: Loan) => void;
  onReject?: (loan: Loan) => void;
  onDisburse?: (loan: Loan) => void;
  showEmployeeColumn?: boolean;
}

export function LoansTable({
  loans,
  isLoading,
  onViewDetails,
  onApprove,
  onReject,
  onDisburse,
  showEmployeeColumn = true,
}: LoansTableProps) {
  const { formatCurrency } = useCompanySettings();
  const isMobile = useIsMobile();

  const getEmployeeName = (loan: Loan) => {
    if (!loan.employee) return "Unknown";
    return loan.employee.full_name || 
      `${loan.employee.first_name} ${loan.employee.last_name}`;
  };

  const getEmployeeInitials = (loan: Loan) => {
    if (!loan.employee) return "?";
    return `${loan.employee.first_name?.[0] || ""}${loan.employee.last_name?.[0] || ""}`;
  };

  const getActions = (loan: Loan): Array<{ label: string; onClick: () => void; icon?: React.ReactNode; destructive?: boolean }> => {
    const actions: Array<{ label: string; onClick: () => void; icon?: React.ReactNode; destructive?: boolean }> = [
      { label: "View Details", onClick: () => onViewDetails(loan), icon: <Eye className="h-4 w-4" /> },
    ];

    if (loan.status === "requested" && onApprove && onReject) {
      actions.push(
        { label: "Approve", onClick: () => onApprove(loan), icon: <CheckCircle className="h-4 w-4" /> },
        { label: "Reject", onClick: () => onReject(loan), icon: <XCircle className="h-4 w-4" />, destructive: true },
      );
    }

    if (loan.status === "approved" && onDisburse) {
      actions.push(
        { label: "Disburse Loan", onClick: () => onDisburse(loan), icon: <Banknote className="h-4 w-4" /> },
      );
    }

    return actions;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Banknote className="h-12 w-12 mb-4 opacity-50" />
        <p>No loans found</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <DataCardList>
        {loans.map((loan) => (
          <DataCard
            key={loan.id}
            title={showEmployeeColumn ? getEmployeeName(loan) : formatCurrency(loan.principal_amount)}
            subtitle={showEmployeeColumn ? formatCurrency(loan.principal_amount) : undefined}
            avatar={showEmployeeColumn ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={loan.employee?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getEmployeeInitials(loan)}
                </AvatarFallback>
              </Avatar>
            ) : undefined}
            fields={[
              { 
                label: "Installment", 
                value: loan.installment_amount ? formatCurrency(loan.installment_amount) : "-" 
              },
              { 
                label: "Duration", 
                value: loan.duration_months ? `${loan.duration_months} months` : "-" 
              },
              { 
                label: "Start Date", 
                value: format(new Date(loan.start_date), "MMM d, yyyy") 
              },
              { 
                label: "Payroll", 
                value: loan.deduct_from_payroll ? (
                  <span className="text-emerald-600">Yes</span>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )
              },
            ]}
            badge={<LoanStatusBadge status={loan.status} />}
            onClick={() => onViewDetails(loan)}
            actions={getActions(loan)}
          />
        ))}
      </DataCardList>
    );
  }

  // Desktop table view
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showEmployeeColumn && <TableHead>Employee</TableHead>}
            <TableHead>Principal</TableHead>
            <TableHead>Installment</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payroll</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan) => (
            <TableRow key={loan.id}>
              {showEmployeeColumn && (
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={loan.employee?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getEmployeeInitials(loan)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getEmployeeName(loan)}</span>
                  </div>
                </TableCell>
              )}
              <TableCell className="font-medium">
                {formatCurrency(loan.principal_amount)}
              </TableCell>
              <TableCell>
                {loan.installment_amount 
                  ? formatCurrency(loan.installment_amount) 
                  : "-"}
              </TableCell>
              <TableCell>
                {loan.duration_months ? `${loan.duration_months} months` : "-"}
              </TableCell>
              <TableCell>
                {format(new Date(loan.start_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <LoanStatusBadge status={loan.status} />
              </TableCell>
              <TableCell>
                {loan.deduct_from_payroll ? (
                  <span className="text-emerald-600 text-sm">Yes</span>
                ) : (
                  <span className="text-muted-foreground text-sm">No</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(loan)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {loan.status === "requested" && onApprove && onReject && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onApprove(loan)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onReject(loan)}
                          className="text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {loan.status === "approved" && onDisburse && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDisburse(loan)}>
                          <Banknote className="mr-2 h-4 w-4" />
                          Disburse Loan
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
