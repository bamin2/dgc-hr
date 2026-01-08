import { useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBulkSalaryWizard } from "@/hooks/useBulkSalaryWizard";
import { toast } from "@/hooks/use-toast";
import { VerticalWizardProgress } from "../VerticalWizardProgress";
import { WIZARD_STEPS } from "./types";
import { SelectEmployeesStep } from "./steps/SelectEmployeesStep";
import { UpdateTypeStep } from "./steps/UpdateTypeStep";
import { SalaryComponentsStep } from "./steps/SalaryComponentsStep";
import { GosiSalaryStep } from "./steps/GosiSalaryStep";
import { EffectiveDateStep } from "./steps/EffectiveDateStep";
import { ReviewSummaryStep } from "./steps/ReviewSummaryStep";
import { ReasonNotesStep } from "./steps/ReasonNotesStep";
import { ConfirmApplyStep } from "./steps/ConfirmApplyStep";

export function BulkSalaryUpdateWizard() {
  const navigate = useNavigate();
  const compensationLoadedRef = useRef(false);
  const {
    data,
    updateData,
    currentStep,
    setCurrentStep,
    teamMembers,
    isLoadingMembers,
    loadTeamMembers,
    loadEmployeeCompensation,
    filteredEmployees,
    selectedEmployees,
    hasGosiEmployees,
    calculateEmployeeImpacts,
    totals,
    validateStep,
    departments,
    positions,
    workLocations,
    allowanceTemplates,
    deductionTemplates,
    submit,
    isSubmitting,
  } = useBulkSalaryWizard();

  // Load team members on mount
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Load employee compensation when entering step 3
  useEffect(() => {
    if (currentStep === 3 && data.selectedEmployeeIds.length > 0 && !compensationLoadedRef.current) {
      compensationLoadedRef.current = true;
      loadEmployeeCompensation(data.selectedEmployeeIds);
    }
  }, [currentStep, data.selectedEmployeeIds, loadEmployeeCompensation]);

  // Determine currency from selected employees' work locations
  const currency = useMemo(() => {
    if (selectedEmployees.length > 0 && selectedEmployees[0].workLocationId) {
      const workLocation = workLocations?.find(wl => wl.id === selectedEmployees[0].workLocationId);
      if (workLocation?.currency) {
        return workLocation.currency;
      }
    }
    return 'BHD'; // Default to BHD
  }, [selectedEmployees, workLocations]);

  // Determine effective steps (skip GOSI if no GOSI employees)
  const effectiveSteps = WIZARD_STEPS.filter(step => {
    if (step.id === 4 && !hasGosiEmployees && data.selectedEmployeeIds.length > 0) {
      return false;
    }
    return true;
  });

  const currentStepIndex = effectiveSteps.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === effectiveSteps.length - 1;

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (isLastStep) {
      handleSubmit();
    } else {
      const nextStep = effectiveSteps[currentStepIndex + 1];
      setCurrentStep(nextStep.id);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevStep = effectiveSteps[currentStepIndex - 1];
      setCurrentStep(prevStep.id);
    }
  };

  const handleSubmit = async () => {
    try {
      await submit();
      toast({
        title: "Salary updates applied",
        description: `Successfully updated salaries for ${data.selectedEmployeeIds.length} employees.`,
      });
      navigate("/employees");
    } catch (error) {
      console.error("Error applying salary updates:", error);
      toast({
        title: "Error",
        description: "Failed to apply salary updates. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SelectEmployeesStep
            data={data}
            onUpdateData={updateData}
            employees={teamMembers}
            departments={(departments || []).map(d => ({ id: d.id, name: d.name }))}
            workLocations={(workLocations || []).map(wl => ({ id: wl.id, name: wl.name }))}
          />
        );
      case 2:
        return (
          <UpdateTypeStep
            data={data}
            onUpdateData={updateData}
            selectedEmployees={selectedEmployees}
            workLocations={workLocations || []}
          />
        );
      case 3:
        return (
          <SalaryComponentsStep
            data={data}
            onUpdateData={updateData}
            allowanceTemplates={allowanceTemplates || []}
            deductionTemplates={deductionTemplates || []}
            selectedEmployees={selectedEmployees}
          />
        );
      case 4:
        return (
          <GosiSalaryStep
            data={data}
            onUpdateData={updateData}
            gosiEmployees={selectedEmployees.filter(e => e.isSubjectToGosi)}
            workLocations={workLocations || []}
            currency={currency}
          />
        );
      case 5:
        return <EffectiveDateStep data={data} onUpdateData={updateData} />;
      case 6:
        return (
          <ReviewSummaryStep
            data={data}
            impacts={calculateEmployeeImpacts}
            totals={totals}
            currency={currency}
          />
        );
      case 7:
        return <ReasonNotesStep data={data} onUpdateData={updateData} />;
      case 8:
        return (
          <ConfirmApplyStep
            data={data}
            onUpdateData={updateData}
            totalChange={totals.change}
            employeeCount={data.selectedEmployeeIds.length}
          />
        );
      default:
        return null;
    }
  };

  if (isLoadingMembers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Left sidebar - Progress */}
      <div className="w-64 shrink-0">
        <VerticalWizardProgress
          steps={effectiveSteps.map((s, idx) => ({ id: idx + 1, label: s.label, description: s.description }))}
          currentStep={currentStepIndex + 1}
        />
      </div>

      {/* Main content */}
      <div className="flex-1">
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/employees")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting || !validateStep(currentStep)}
              className={isLastStep ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Apply Changes
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
