import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { useCreatePayrollRun, usePayrollRun, useUpdatePayrollRun, useCheckExistingDraft } from "@/hooks/usePayrollRunsV2";
import { usePayrollRunEmployees } from "@/hooks/usePayrollRunEmployees";
import { usePayrollRunAdjustments } from "@/hooks/usePayrollRunAdjustments";
import { WizardProgress } from "./WizardProgress";
import { ConfirmLocationStep } from "./ConfirmLocationStep";
import { PayPeriodStep } from "./PayPeriodStep";
import { SelectEmployeesStep } from "./SelectEmployeesStep";
import { AdjustmentsStep } from "./AdjustmentsStep";
import { ReviewFinalizeStep } from "./ReviewFinalizeStep";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const STEPS = [
  { id: 0, label: "Location", description: "Confirm work location" },
  { id: 1, label: "Pay Period", description: "Select pay period" },
  { id: 2, label: "Employees", description: "Select employees" },
  { id: 3, label: "Adjustments", description: "Add adjustments" },
  { id: 4, label: "Review", description: "Review & finalize" },
];

interface PayrollRunWizardProps {
  location: WorkLocation;
  existingRunId?: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

export function PayrollRunWizard({
  location,
  existingRunId,
  onComplete,
  onCancel,
}: PayrollRunWizardProps) {
  const [currentStep, setCurrentStep] = useState(existingRunId ? 2 : 0);
  const [runId, setRunId] = useState<string | null>(existingRunId || null);
  const [payPeriodStart, setPayPeriodStart] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [payPeriodEnd, setPayPeriodEnd] = useState<string>(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const { data: existingRun } = usePayrollRun(existingRunId || null);
  const { data: existingDraft } = useCheckExistingDraft(
    location.id,
    payPeriodStart,
    payPeriodEnd
  );

  const createRun = useCreatePayrollRun();
  const updateRun = useUpdatePayrollRun();
  const { data: adjustments = [] } = usePayrollRunAdjustments(runId);
  const { data: runEmployees = [], snapshotEmployees } = usePayrollRunEmployees(runId);

  // Load existing run data
  useEffect(() => {
    if (existingRun) {
      setPayPeriodStart(existingRun.payPeriodStart);
      setPayPeriodEnd(existingRun.payPeriodEnd);
    }
  }, [existingRun]);

  const handleNext = async () => {
    if (currentStep === 1) {
      // Check for existing draft when moving past pay period step
      if (existingDraft && existingDraft.id !== runId) {
        toast({
          title: "Draft Already Exists",
          description: "A draft for this period already exists. Please resume that draft or choose a different period.",
          variant: "destructive",
        });
        return;
      }

      // Create the payroll run if we don't have one
      if (!runId) {
        try {
          const newRun = await createRun.mutateAsync({
            locationId: location.id,
            payPeriodStart,
            payPeriodEnd,
          });
          setRunId(newRun.id);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create payroll run. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    if (currentStep === 2 && runId) {
      if (selectedEmployeeIds.length === 0) {
        toast({
          title: "No employees selected",
          description: "Please select at least one employee to continue.",
          variant: "destructive",
        });
        return;
      }

      // Snapshot employees when moving past employee selection - pass runId explicitly to avoid stale closure
      try {
        await snapshotEmployees(runId, selectedEmployeeIds);
      } catch (error: unknown) {
        console.error("Failed to snapshot employees", { runId, selectedEmployeeIds, error });

        const message =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error && "message" in error
              ? String((error as { message: unknown }).message)
              : "Unknown error";

        toast({
          title: "Error",
          description: `Failed to save employee selection: ${message}`,
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSaveDraft = async () => {
    toast({
      title: "Draft Saved",
      description: "Your payroll run has been saved as a draft.",
    });
    onComplete();
  };

  const handleFinalize = async () => {
    if (!runId) return;

    try {
      const totalAmount = runEmployees.reduce((sum, emp) => sum + (emp.netPay || 0), 0);
      
      await updateRun.mutateAsync({
        runId,
        status: 'finalized',
        totalAmount,
        employeeCount: runEmployees.length,
      });

      toast({
        title: "Payroll Finalized",
        description: "Your payroll run has been finalized successfully.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finalize payroll run. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Progress */}
      <div className="w-64 flex-shrink-0 hidden lg:block">
        <WizardProgress steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border rounded-lg p-6">
          {currentStep === 0 && (
            <ConfirmLocationStep location={location} />
          )}

          {currentStep === 1 && (
            <PayPeriodStep
              payPeriodStart={payPeriodStart}
              payPeriodEnd={payPeriodEnd}
              onStartChange={setPayPeriodStart}
              onEndChange={setPayPeriodEnd}
              existingDraft={existingDraft}
              onResumeDraft={(draftId) => {
                setRunId(draftId);
                setCurrentStep(2);
              }}
            />
          )}

          {currentStep === 2 && (
            <SelectEmployeesStep
              locationId={location.id}
              selectedIds={selectedEmployeeIds}
              onSelectionChange={setSelectedEmployeeIds}
            />
          )}

          {currentStep === 3 && (
            <AdjustmentsStep
              runId={runId}
              employees={runEmployees}
              payPeriodStart={payPeriodStart}
              payPeriodEnd={payPeriodEnd}
            />
          )}

          {currentStep === 4 && (
            <ReviewFinalizeStep
              location={location}
              payPeriodStart={payPeriodStart}
              payPeriodEnd={payPeriodEnd}
              employees={runEmployees}
              adjustments={adjustments}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={currentStep === 0 ? onCancel : handleBack}>
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>

            <div className="flex gap-2">
              {currentStep >= 1 && currentStep < STEPS.length - 1 && (
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    createRun.isPending ||
                    (currentStep === 2 && selectedEmployeeIds.length === 0)
                  }
                >
                  {createRun.isPending ? "Creating..." : "Continue"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    Save Draft
                  </Button>
                  <Button onClick={handleFinalize} disabled={updateRun.isPending}>
                    {updateRun.isPending ? "Finalizing..." : "Finalize Payroll"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
