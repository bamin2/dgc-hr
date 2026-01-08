import { ArrowLeft, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayrollRunCard, PayrollRunData } from "./PayrollRunCard";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { Skeleton } from "@/components/ui/skeleton";

interface PayrollRunsListProps {
  location: WorkLocation;
  runs: PayrollRunData[];
  isLoading: boolean;
  onBack: () => void;
  onNewRun: () => void;
  onResumeRun: (runId: string) => void;
  onViewRun: (runId: string) => void;
  onIssuePayslips: (runId: string) => void;
  onDeleteRun: (runId: string) => void;
}

export function PayrollRunsList({
  location,
  runs,
  isLoading,
  onBack,
  onNewRun,
  onResumeRun,
  onViewRun,
  onIssuePayslips,
  onDeleteRun,
}: PayrollRunsListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{location.name}</h2>
            <p className="text-sm text-muted-foreground">
              {location.currency} • {location.employeeCount || 0} employees
            </p>
          </div>
        </div>
        <Button onClick={onNewRun} className="gap-2">
          <Plus className="h-4 w-4" />
          Run New Payroll
        </Button>
      </div>

      {/* Runs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Payroll Runs</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by running your first payroll for this location.
          </p>
          <Button onClick={onNewRun} className="gap-2">
            <Plus className="h-4 w-4" />
            Run New Payroll
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => (
            <PayrollRunCard
              key={run.id}
              run={{ ...run, currency: location.currency }}
              onResume={() => onResumeRun(run.id)}
              onView={() => onViewRun(run.id)}
              onIssuePayslips={() => onIssuePayslips(run.id)}
              onDelete={() => onDeleteRun(run.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
