import { format } from "date-fns";
import { CheckCircle } from "lucide-react";
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
import { LoanInstallment } from "@/hooks/useLoans";

interface LoanInstallmentsTableProps {
  installments: LoanInstallment[];
  canMarkPaid?: boolean;
  onMarkPaid?: (installmentId: string) => void;
}

export function LoanInstallmentsTable({
  installments,
  canMarkPaid = false,
  onMarkPaid,
}: LoanInstallmentsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (installment: LoanInstallment) => {
    if (installment.status === "paid") {
      return (
        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
          Paid {installment.paid_method === "payroll" ? "(Payroll)" : "(Manual)"}
        </Badge>
      );
    }
    if (installment.status === "skipped") {
      return <Badge variant="outline">Skipped</Badge>;
    }
    
    const dueDate = new Date(installment.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">Due</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            {canMarkPaid && <TableHead className="w-[100px]"></TableHead>}
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
              {canMarkPaid && (
                <TableCell>
                  {installment.status === "due" && onMarkPaid && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkPaid(installment.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
