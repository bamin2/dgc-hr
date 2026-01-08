import { format } from "date-fns";
import { CheckCircle, SkipForward } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoanInstallment } from "@/hooks/useLoans";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface LoanInstallmentsTableProps {
  installments: LoanInstallment[];
  canMarkPaid?: boolean;
  canSkip?: boolean;
  onMarkPaid?: (installmentId: string) => void;
  onSkip?: (installment: LoanInstallment) => void;
}

export function LoanInstallmentsTable({
  installments,
  canMarkPaid = false,
  canSkip = false,
  onMarkPaid,
  onSkip,
}: LoanInstallmentsTableProps) {
  const { formatCurrency } = useCompanySettings();

  const getStatusBadge = (installment: LoanInstallment) => {
    if (installment.status === "paid") {
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
          Paid {installment.paid_method === "payroll" ? "(Payroll)" : "(Manual)"}
        </Badge>
      );
    }
    if (installment.status === "skipped") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-muted-foreground">
                Skipped
              </Badge>
            </TooltipTrigger>
            {(installment as any).skipped_reason && (
              <TooltipContent>
                <p>{(installment as any).skipped_reason}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    const dueDate = new Date(installment.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">Due</Badge>;
  };

  const showActions = canMarkPaid || canSkip;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="w-[140px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((installment) => (
            <TableRow key={installment.id}>
              <TableCell className="font-medium">
                {installment.installment_number}
              </TableCell>
              <TableCell>
                {format(new Date(installment.due_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {formatCurrency(installment.amount)}
              </TableCell>
              <TableCell>
                {getStatusBadge(installment)}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-1">
                    {installment.status === "due" && canSkip && onSkip && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => onSkip(installment)}
                      >
                        <SkipForward className="h-3 w-3 mr-1" />
                        Skip
                      </Button>
                    )}
                    {installment.status === "due" && canMarkPaid && onMarkPaid && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => onMarkPaid(installment.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paid
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
