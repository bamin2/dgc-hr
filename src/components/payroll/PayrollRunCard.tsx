import { format } from "date-fns";
import { Calendar, Users, User, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayrollRunStatusBadge, PayrollRunStatus } from "./PayrollRunStatusBadge";

export interface PayrollRunData {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  status: PayrollRunStatus;
  totalAmount: number | null;
  employeeCount: number;
  createdAt: string;
  createdByName?: string;
  currency?: string;
}

interface PayrollRunCardProps {
  run: PayrollRunData;
  onResume?: () => void;
  onView?: () => void;
  onIssuePayslips?: () => void;
  onDelete?: () => void;
}

export function PayrollRunCard({ run, onResume, onView, onIssuePayslips, onDelete }: PayrollRunCardProps) {
  const periodLabel = format(new Date(run.payPeriodStart), "MMM yyyy");
  const periodRange = `${format(new Date(run.payPeriodStart), "d")} - ${format(new Date(run.payPeriodEnd), "d")}`;
  const createdDate = format(new Date(run.createdAt), "MMM d");
  const currency = run.currency || "USD";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground">
                  {periodLabel} ({periodRange})
                </h3>
                <PayrollRunStatusBadge status={run.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{run.employeeCount} employees</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Created {createdDate}</span>
                  {run.createdByName && <span>by {run.createdByName}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {run.status !== 'draft' && run.totalAmount !== null && (
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground">
                  {currency} {run.totalAmount.toLocaleString()}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              {run.status === 'draft' && (
                <>
                  {onResume && (
                    <Button onClick={onResume} size="sm">
                      Resume Draft
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
              {run.status === 'finalized' && (
                <>
                  {onView && (
                    <Button variant="outline" onClick={onView} size="sm">
                      View
                    </Button>
                  )}
                  {onIssuePayslips && (
                    <Button onClick={onIssuePayslips} size="sm">
                      Issue Payslips
                    </Button>
                  )}
                </>
              )}
              {run.status === 'payslips_issued' && onView && (
                <Button variant="outline" onClick={onView} size="sm">
                  View Payroll Register
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
