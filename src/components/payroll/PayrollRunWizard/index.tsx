import { WorkLocation } from "@/hooks/useWorkLocations";
import { usePayrollWizard } from "@/hooks/usePayrollWizard";
import { WizardProgress } from "./WizardProgress";
import { ConfirmLocationStep } from "./ConfirmLocationStep";
import { PayPeriodStep } from "./PayPeriodStep";
import { SelectEmployeesStep } from "./SelectEmployeesStep";
import { AdjustmentsStep } from "./AdjustmentsStep";
import { ReviewFinalizeStep } from "./ReviewFinalizeStep";
import { Button } from "@/components/ui/button";

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
  const { state, actions, data, status, steps } = usePayrollWizard({
    location,
    existingRunId,
    onComplete,
  });

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === steps.length - 1;
  const showSaveDraft = state.currentStep >= 1 && !isLastStep;

  return (
    <div className="flex gap-6">
      {/* Sidebar Progress */}
      <div className="w-64 flex-shrink-0 hidden lg:block">
        <WizardProgress steps={steps} currentStep={state.currentStep} />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-card border rounded-lg p-6">
          {state.currentStep === 0 && (
            <ConfirmLocationStep location={location} />
          )}

          {state.currentStep === 1 && (
            <PayPeriodStep
              payPeriodStart={state.payPeriodStart}
              payPeriodEnd={state.payPeriodEnd}
              onStartChange={actions.setPayPeriodStart}
              onEndChange={actions.setPayPeriodEnd}
              existingDraft={data.existingDraft}
              onResumeDraft={actions.resumeDraft}
            />
          )}

          {state.currentStep === 2 && (
            <SelectEmployeesStep
              locationId={location.id}
              selectedIds={state.selectedEmployeeIds}
              onSelectionChange={actions.setSelectedEmployeeIds}
            />
          )}

          {state.currentStep === 3 && (
            <AdjustmentsStep
              runId={state.runId}
              employees={data.runEmployees}
              payPeriodStart={state.payPeriodStart}
              payPeriodEnd={state.payPeriodEnd}
            />
          )}

          {state.currentStep === 4 && (
            <ReviewFinalizeStep
              location={location}
              payPeriodStart={state.payPeriodStart}
              payPeriodEnd={state.payPeriodEnd}
              employees={data.runEmployees}
              adjustments={data.adjustments}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={isFirstStep ? onCancel : actions.goBack}
            >
              {isFirstStep ? "Cancel" : "Back"}
            </Button>

            <div className="flex gap-2">
              {showSaveDraft && (
                <Button variant="outline" onClick={actions.saveDraft}>
                  Save Draft
                </Button>
              )}
              
              {!isLastStep ? (
                <Button
                  onClick={actions.goNext}
                  disabled={status.isCreating || !status.canProceed}
                >
                  {status.isCreating ? "Creating..." : "Continue"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={actions.saveDraft}>
                    Save Draft
                  </Button>
                  <Button
                    onClick={actions.finalize}
                    disabled={status.isUpdating}
                  >
                    {status.isUpdating ? "Finalizing..." : "Finalize Payroll"}
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
