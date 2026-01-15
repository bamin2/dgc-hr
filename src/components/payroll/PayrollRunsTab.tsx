import { useState, useMemo } from "react";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { LocationSelector } from "./LocationSelector";
import { PayrollRunsList } from "./PayrollRunsList";
import { PayrollRunWizard } from "./PayrollRunWizard";
import { PayrollRegister } from "./PayrollRegister";
import { DeletePayrollRunDialog } from "./DeletePayrollRunDialog";
import { usePayrollRunsByLocation, useDraftCountsByLocation } from "@/hooks/usePayrollRunsV2";
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
  const [initialTab, setInitialTab] = useState<string>("register");
  const [deletingRunId, setDeletingRunId] = useState<string | null>(null);

  const { data: draftCounts = {} } = useDraftCountsByLocation();
  const { data: runs = [], isLoading: runsLoading } = usePayrollRunsByLocation(
    selectedLocation?.id || null
  );

  // Find the run data for dialogs
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
    setInitialTab("register");
    setView('register');
  };

  const handleIssuePayslips = (runId: string) => {
    setViewingRunId(runId);
    setInitialTab("payslips");
    setView('register');
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
    setInitialTab("register");
    setView('runs');
  };

  if (view === 'register' && selectedLocation && viewingRun) {
    return (
      <PayrollRegister
        run={viewingRun}
        location={selectedLocation}
        onBack={handleBackToRuns}
        initialTab={initialTab}
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
