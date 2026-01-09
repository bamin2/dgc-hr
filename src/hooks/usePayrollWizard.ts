/**
 * usePayrollWizard Hook
 * Manages wizard state and step navigation for the PayrollRunWizard component
 */

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { useCreatePayrollRun, usePayrollRun, useUpdatePayrollRun, useCheckExistingDraft } from "@/hooks/usePayrollRunsV2";
import { usePayrollRunEmployees } from "@/hooks/usePayrollRunEmployees";
import { usePayrollRunAdjustments } from "@/hooks/usePayrollRunAdjustments";
import { toast } from "@/hooks/use-toast";

// ============================================
// Types
// ============================================

export interface WizardStep {
  id: number;
  label: string;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 0, label: "Location", description: "Confirm work location" },
  { id: 1, label: "Pay Period", description: "Select pay period" },
  { id: 2, label: "Employees", description: "Select employees" },
  { id: 3, label: "Adjustments", description: "Add adjustments" },
  { id: 4, label: "Review", description: "Review & finalize" },
];

export interface PayrollWizardState {
  currentStep: number;
  runId: string | null;
  payPeriodStart: string;
  payPeriodEnd: string;
  selectedEmployeeIds: string[];
}

export interface PayrollWizardActions {
  goToStep: (step: number) => void;
  goNext: () => Promise<void>;
  goBack: () => void;
  setPayPeriodStart: (date: string) => void;
  setPayPeriodEnd: (date: string) => void;
  setSelectedEmployeeIds: (ids: string[]) => void;
  resumeDraft: (draftId: string) => void;
  saveDraft: () => Promise<void>;
  finalize: () => Promise<void>;
}

export interface PayrollWizardData {
  existingRun: ReturnType<typeof usePayrollRun>['data'];
  existingDraft: ReturnType<typeof useCheckExistingDraft>['data'];
  runEmployees: ReturnType<typeof usePayrollRunEmployees>['data'];
  adjustments: ReturnType<typeof usePayrollRunAdjustments>['data'];
}

export interface PayrollWizardStatus {
  isCreating: boolean;
  isUpdating: boolean;
  canProceed: boolean;
}

export interface UsePayrollWizardReturn {
  state: PayrollWizardState;
  actions: PayrollWizardActions;
  data: PayrollWizardData;
  status: PayrollWizardStatus;
  steps: WizardStep[];
}

interface UsePayrollWizardOptions {
  location: WorkLocation;
  existingRunId?: string | null;
  onComplete: () => void;
}

// ============================================
// Hook Implementation
// ============================================

export function usePayrollWizard({
  location,
  existingRunId,
  onComplete,
}: UsePayrollWizardOptions): UsePayrollWizardReturn {
  // State
  const [currentStep, setCurrentStep] = useState(existingRunId ? 2 : 0);
  const [runId, setRunId] = useState<string | null>(existingRunId || null);
  const [payPeriodStart, setPayPeriodStart] = useState<string>(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [payPeriodEnd, setPayPeriodEnd] = useState<string>(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  // Data hooks
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

  // Navigation actions
  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, WIZARD_STEPS.length - 1)));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goNext = useCallback(async () => {
    // Step 1: Pay Period - Create run if needed
    if (currentStep === 1) {
      if (existingDraft && existingDraft.id !== runId) {
        toast({
          title: "Draft Already Exists",
          description: "A draft for this period already exists. Please resume that draft or choose a different period.",
          variant: "destructive",
        });
        return;
      }

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

    // Step 2: Employee Selection - Snapshot employees
    if (currentStep === 2 && runId) {
      if (selectedEmployeeIds.length === 0) {
        toast({
          title: "No employees selected",
          description: "Please select at least one employee to continue.",
          variant: "destructive",
        });
        return;
      }

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

    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  }, [currentStep, existingDraft, runId, location.id, payPeriodStart, payPeriodEnd, selectedEmployeeIds, createRun, snapshotEmployees]);

  const resumeDraft = useCallback((draftId: string) => {
    setRunId(draftId);
    setCurrentStep(2);
  }, []);

  const saveDraft = useCallback(async () => {
    toast({
      title: "Draft Saved",
      description: "Your payroll run has been saved as a draft.",
    });
    onComplete();
  }, [onComplete]);

  const finalize = useCallback(async () => {
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
  }, [runId, runEmployees, updateRun, onComplete]);

  // Computed status
  const canProceed = currentStep !== 2 || selectedEmployeeIds.length > 0;

  return {
    state: {
      currentStep,
      runId,
      payPeriodStart,
      payPeriodEnd,
      selectedEmployeeIds,
    },
    actions: {
      goToStep,
      goNext,
      goBack,
      setPayPeriodStart,
      setPayPeriodEnd,
      setSelectedEmployeeIds,
      resumeDraft,
      saveDraft,
      finalize,
    },
    data: {
      existingRun,
      existingDraft,
      runEmployees,
      adjustments,
    },
    status: {
      isCreating: createRun.isPending,
      isUpdating: updateRun.isPending,
      canProceed,
    },
    steps: WIZARD_STEPS,
  };
}
