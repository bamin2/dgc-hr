import { useState, useMemo } from "react";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { LocationSelector } from "./LocationSelector";
import { PayrollRunsList } from "./PayrollRunsList";
import { PayrollRunWizard } from "./PayrollRunWizard";
import { PayrollRegister } from "./PayrollRegister";
import { IssuePayslipsDialog } from "./IssuePayslipsDialog";
import { DeletePayrollRunDialog } from "./DeletePayrollRunDialog";
import { usePayrollRunsByLocation, useDraftCountsByLocation } from "@/hooks/usePayrollRunsV2";
import { usePayrollRunEmployees } from "@/hooks/usePayrollRunEmployees";
import { usePayrollRunAdjustments } from "@/hooks/usePayrollRunAdjustments";
import { format } from "date-fns";

type View = 'locations' | 'runs' | 'wizard' | 'register';

interface PayrollRunsTabProps {
  autoStartWizard?: boolean;
  onWizardStarted?: () => void;
}

export function PayrollRunsTab({ autoStartWizard, onWizardStarted }: PayrollRunsTabProps) {
  const [view, setView] = useState<View>('locations');
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(null);
  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [viewingRunId, setViewingRunId] = useState<string | null>(null);
  const [issuingPayslipsRunId, setIssuingPayslipsRunId] = useState<string | null>(null);
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null);

  const { data: draftCounts = {} } = useDraftCountsByLocation();
  const { data: runs = [], isLoading: runsLoading } = usePayrollRunsByLocation(
    selectedLocation?.id || null
  );

  // Data for issue payslips dialog
  const { data: payslipEmployees = [] } = usePayrollRunEmployees(issuingPayslipsRunId);
  const { data: payslipAdjustments = [] } = usePayrollRunAdjustments(issuingPayslipsRunId);

  // Find the run data for dialogs
  const issuingRun = useMemo(() => 
    runs.find(r => r.id === issuingPayslipsRunId), 
    [runs, issuingPayslipsRunId]
  );
  const deletingRun = useMemo(() => 
    runs.find(r => r.id === deletingRunId), 
    [runs, deletingRunId]
  );
  const viewingRun = useMemo(() => 
    runs.find(r => r.id === viewingRunId), 
    [runs, viewingRunId]
  );

  const handleSelectLocation = (location: WorkLocation) => {
    setSelectedLocation(location);
    if (autoStartWizard) {
      setView('wizard');
      onWizardStarted?.();
    } else {
      setView('runs');
    }
  };

  const handleBackToLocations = () => {
    setSelectedLocation(null);
    setView('locations');
  };

  const handleNewRun = () => {
    setEditingRunId(null);
    setView('wizard');
  };

  const handleResumeRun = (runId: string) => {
    setEditingRunId(runId);
    setView('wizard');
  };

  const handleViewRun = (runId: string) => {
    setViewingRunId(runId);
    setView('register');
  };

  const handleIssuePayslips = (runId: string) => {
    setIssuingPayslipsRunId(runId);
  };

  const handleDeleteRun = (runId: string) => {
    setDeletingRunId(runId);
  };

  const handleWizardComplete = () => {
    setEditingRunId(null);
    setView('runs');
  };

  const handleWizardCancel = () => {
    setEditingRunId(null);
    setView('runs');
  };

  const handleBackToRuns = () => {
    setViewingRunId(null);
    setView('runs');
  };

  if (view === 'register' && selectedLocation && viewingRun) {
    return (
      <PayrollRegister
        run={viewingRun}
        location={selectedLocation}
        onBack={handleBackToRuns}
        onIssuePayslips={() => setIssuingPayslipsRunId(viewingRun.id)}
      />
    );
  }

  if (view === 'wizard' && selectedLocation) {
    return (
      <PayrollRunWizard
        location={selectedLocation}
        existingRunId={editingRunId}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  if (view === 'runs' && selectedLocation) {
    return (
      <>
        <PayrollRunsList
          location={selectedLocation}
          runs={runs}
          isLoading={runsLoading}
          onBack={handleBackToLocations}
          onNewRun={handleNewRun}
          onResumeRun={handleResumeRun}
          onViewRun={handleViewRun}
          onIssuePayslips={handleIssuePayslips}
          onDeleteRun={handleDeleteRun}
        />
        {issuingRun && (
          <IssuePayslipsDialog
            open={!!issuingPayslipsRunId}
            onOpenChange={(open) => !open && setIssuingPayslipsRunId(null)}
            runId={issuingRun.id}
            employees={payslipEmployees}
            adjustments={payslipAdjustments}
            location={{ name: selectedLocation.name, currency: selectedLocation.currency }}
            payPeriod={{ start: issuingRun.payPeriodStart, end: issuingRun.payPeriodEnd }}
            onComplete={() => setIssuingPayslipsRunId(null)}
          />
        )}
        {deletingRun && (
          <DeletePayrollRunDialog
            open={!!deletingRunId}
            onOpenChange={(open) => !open && setDeletingRunId(null)}
            runId={deletingRun.id}
            periodLabel={format(new Date(deletingRun.payPeriodStart), "MMMM yyyy")}
            onDeleted={() => setDeletingRunId(null)}
          />
        )}
      </>
    );
  }

  return (
    <LocationSelector
      onSelectLocation={handleSelectLocation}
      draftCounts={draftCounts}
    />
  );
}
