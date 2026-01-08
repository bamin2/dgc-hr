import { CheckCircle, Clock, Loader2, FileEdit, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayrollRun } from "@/data/payroll";
import { format } from "date-fns";

interface RecentPayrollRunsProps {
  runs: PayrollRun[];
}

type RunStatus = 'completed' | 'processing' | 'scheduled' | 'draft' | 'finalized' | 'payslips_issued';

const statusIcons: Record<RunStatus, React.ComponentType<{ className?: string }>> = {
  completed: CheckCircle,
  processing: Loader2,
  scheduled: Clock,
  draft: FileEdit,
  finalized: FileCheck,
  payslips_issued: CheckCircle,
};

const statusColors: Record<RunStatus, string> = {
  completed: "text-success",
  processing: "text-info",
  scheduled: "text-warning",
  draft: "text-muted-foreground",
  finalized: "text-primary",
  payslips_issued: "text-success",
};

export function RecentPayrollRuns({ runs }: RecentPayrollRunsProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Payroll Runs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {runs.map((run) => {
          const status = run.status as RunStatus;
          const StatusIcon = statusIcons[status] || Clock;
          const colorClass = statusColors[status] || "text-muted-foreground";
          return (
            <div key={run.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full bg-muted ${colorClass}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(run.payPeriod.startDate), 'MMM yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {run.employeeCount} employees
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${run.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {status.replace('_', ' ')}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
