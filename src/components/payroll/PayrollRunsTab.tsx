import { useState } from "react";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { LocationSelector } from "./LocationSelector";
import { PayrollRunsList } from "./PayrollRunsList";
import { PayrollRunWizard } from "./PayrollRunWizard";
import { usePayrollRunsByLocation, useDraftCountsByLocation } from "@/hooks/usePayrollRunsV2";
import { toast } from "@/hooks/use-toast";

type View = 'locations' | 'runs' | 'wizard';

interface PayrollRunsTabProps {
  autoStartWizard?: boolean;
  onWizardStarted?: () => void;
}

export function PayrollRunsTab({ autoStartWizard, onWizardStarted }: PayrollRunsTabProps) {
  const [view, setView] = useState<View>('locations');
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(null);
  const [editingRunId, setEditingRunId] = useState<string | null>(null);

  const { data: draftCounts = {} } = useDraftCountsByLocation();
  const { data: runs = [], isLoading: runsLoading } = usePayrollRunsByLocation(
    selectedLocation?.id || null
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
    // TODO: Implement payroll register view
    toast({
      title: "Coming Soon",
      description: "Payroll register view will be available soon.",
    });
  };

  const handleIssuePayslips = (runId: string) => {
    // TODO: Implement payslip issuing
    toast({
      title: "Coming Soon",
      description: "Payslip issuing will be available soon.",
    });
  };

  const handleWizardComplete = () => {
    setEditingRunId(null);
    setView('runs');
  };

  const handleWizardCancel = () => {
    setEditingRunId(null);
    setView('runs');
  };

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
      <PayrollRunsList
        location={selectedLocation}
        runs={runs}
        isLoading={runsLoading}
        onBack={handleBackToLocations}
        onNewRun={handleNewRun}
        onResumeRun={handleResumeRun}
        onViewRun={handleViewRun}
        onIssuePayslips={handleIssuePayslips}
      />
    );
  }

  return (
    <LocationSelector
      onSelectLocation={handleSelectLocation}
      draftCounts={draftCounts}
    />
  );
}
