import { Eye, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PayrollRecord } from "@/data/payroll";

interface PayrollTableProps {
  records: PayrollRecord[];
}

export function PayrollTable({ records }: PayrollTableProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getTotalDeductions = (deductions: PayrollRecord['deductions']) => {
    return deductions.tax + deductions.insurance + deductions.other;
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Employee</TableHead>
            <TableHead className="font-semibold text-foreground">Department</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Base Salary</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Bonuses</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Deductions</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Net Pay</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={record.employee.avatar} alt={`${record.employee.firstName} ${record.employee.lastName}`} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {record.employee.firstName[0]}{record.employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {record.employee.firstName} {record.employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.employee.position}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{record.employee.department}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(record.baseSalary)}</TableCell>
              <TableCell className="text-right">
                <span className={record.bonuses > 0 ? "text-success" : "text-muted-foreground"}>
                  {record.bonuses > 0 ? `+${formatCurrency(record.bonuses)}` : '-'}
                </span>
              </TableCell>
              <TableCell className="text-right text-destructive">
                -{formatCurrency(getTotalDeductions(record.deductions))}
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground">
                {formatCurrency(record.netPay)}
              </TableCell>
              <TableCell className="text-center">
                <PaymentStatusBadge status={record.status} />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/payroll/payslip/${record.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {records.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No payroll records found
        </div>
      )}
    </div>
  );
}
