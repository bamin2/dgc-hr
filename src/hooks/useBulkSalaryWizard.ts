import { useState, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "./useTeamMembers";
import { useActiveAllowanceTemplates } from "./useAllowanceTemplates";
import { useActiveDeductionTemplates } from "./useDeductionTemplates";
import { useDepartmentsManagement } from "./useDepartmentsManagement";
import { usePositionsManagement } from "./usePositionsManagement";
import { useWorkLocations } from "./useWorkLocations";
import { TablesInsert } from "@/integrations/supabase/types";
import {
  BulkSalaryWizardData,
  EmployeeImpact,
  UpdateType,
  initialWizardData,
  AllowanceEntryExtended,
  DeductionEntryExtended,
} from "@/components/team/wizard/bulk-salary/types";

// Extended TeamMember with GOSI fields
export interface TeamMemberWithGosi extends TeamMember {
  gosiRegisteredSalary?: number;
  isSubjectToGosi?: boolean;
  nationality?: string;
  workLocationId?: string;
  currency?: string;
}

// Fetch team members with GOSI fields
async function fetchTeamMembersWithGosi(): Promise<TeamMemberWithGosi[]> {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments!employees_department_id_fkey(id, name),
      position:positions!employees_position_id_fkey(id, title),
      manager:employees!manager_id(id, first_name, last_name),
      work_location_ref:work_locations!employees_work_location_id_fkey(id, name, currency)
    `)
    .in('status', ['active', 'on_leave', 'on_boarding'])
    .order("first_name");

  if (error) throw error;

  return (data || []).map((db: any) => {
    const manager = Array.isArray(db.manager) ? db.manager[0] : db.manager;
    const workLocationRef = Array.isArray(db.work_location_ref) ? db.work_location_ref[0] : db.work_location_ref;
    return {
      id: db.id,
      firstName: db.first_name,
      lastName: db.last_name,
      preferredName: db.preferred_name || undefined,
      email: db.email,
      avatar: db.avatar_url || undefined,
      workerType: db.worker_type || 'employee',
      country: db.country || undefined,
      nationality: db.nationality || undefined,
      startDate: db.join_date || new Date().toISOString().split("T")[0],
      department: db.department?.name || "Unknown",
      departmentId: db.department_id || undefined,
      jobTitle: db.position?.title || "Unknown",
      positionId: db.position_id || undefined,
      employmentType: db.employment_type || 'full_time',
      status: db.status === 'active' ? 'active' : db.status === 'on_leave' ? 'absent' : db.status === 'on_boarding' ? 'onboarding' : db.status === 'terminated' ? 'dismissed' : 'active',
      managerId: db.manager_id || undefined,
      managerName: manager ? `${manager.first_name} ${manager.last_name}` : undefined,
      workLocation: workLocationRef?.name || db.work_location || db.location || undefined,
      workLocationId: db.work_location_id || undefined,
      currency: workLocationRef?.currency || 'USD',
      salary: db.salary ? Number(db.salary) : undefined,
      payFrequency: db.pay_frequency || 'month',
      taxExemptionStatus: db.tax_exemption_status || undefined,
      sendOfferLetter: db.send_offer_letter || false,
      offerLetterTemplate: db.offer_letter_template || undefined,
      gosiRegisteredSalary: db.gosi_registered_salary ? Number(db.gosi_registered_salary) : undefined,
      isSubjectToGosi: db.is_subject_to_gosi || false,
    };
  });
}

export function useBulkSalaryWizard() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<BulkSalaryWizardData>(initialWizardData);
  const [currentStep, setCurrentStep] = useState(1);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithGosi[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const { data: departments } = useDepartmentsManagement();
  const { data: positions } = usePositionsManagement();
  const { data: workLocations } = useWorkLocations();
  const { data: allowanceTemplates } = useActiveAllowanceTemplates();
  const { data: deductionTemplates } = useActiveDeductionTemplates();

  // Load team members with GOSI fields
  const loadTeamMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const members = await fetchTeamMembersWithGosi();
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  // Load existing allowances and deductions for selected employees
  const loadEmployeeCompensation = useCallback(async (employeeIds: string[]) => {
    if (employeeIds.length === 0) return;

    // Fetch existing allowances
    const { data: allowancesData } = await supabase
      .from('employee_allowances')
      .select('*, allowance_template:allowance_templates(*)')
      .in('employee_id', employeeIds);

    // Fetch existing deductions
    const { data: deductionsData } = await supabase
      .from('employee_deductions')
      .select('*, deduction_template:deduction_templates(*)')
      .in('employee_id', employeeIds);

    // Build per-employee allowances
    const perEmployeeAllowances: Record<string, AllowanceEntryExtended[]> = {};
    const perEmployeeDeductions: Record<string, DeductionEntryExtended[]> = {};

    // Initialize for all selected employees
    employeeIds.forEach(id => {
      perEmployeeAllowances[id] = [];
      perEmployeeDeductions[id] = [];
    });

    // Map allowances
    (allowancesData || []).forEach((a: any) => {
      const template = Array.isArray(a.allowance_template) ? a.allowance_template[0] : a.allowance_template;
      const amount = a.custom_amount ?? template?.amount ?? 0;
      
      perEmployeeAllowances[a.employee_id]?.push({
        id: a.id,
        templateId: a.allowance_template_id || undefined,
        customName: a.custom_name || undefined,
        amount: amount,
        originalAmount: amount,
        isCustom: !a.allowance_template_id,
        isPercentage: template?.amount_type === 'percentage',
        percentageOf: template?.percentage_of || undefined,
        isExisting: true,
        dbRecordId: a.id,
      });
    });

    // Map deductions
    (deductionsData || []).forEach((d: any) => {
      const template = Array.isArray(d.deduction_template) ? d.deduction_template[0] : d.deduction_template;
      const amount = d.custom_amount ?? template?.amount ?? 0;
      
      perEmployeeDeductions[d.employee_id]?.push({
        id: d.id,
        templateId: d.deduction_template_id || undefined,
        customName: d.custom_name || undefined,
        amount: amount,
        originalAmount: amount,
        isCustom: !d.deduction_template_id,
        isPercentage: template?.amount_type === 'percentage',
        percentageOf: template?.percentage_of || undefined,
        isExisting: true,
        dbRecordId: d.id,
      });
    });

    setData(prev => ({
      ...prev,
      perEmployeeAllowances,
      perEmployeeDeductions,
    }));
  }, []);

  // Update wizard data
  const updateData = useCallback(<K extends keyof BulkSalaryWizardData>(
    field: K,
    value: BulkSalaryWizardData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Filter employees based on criteria
  const filteredEmployees = useMemo(() => {
    let result = [...teamMembers];
    
    if (data.filters.departmentId) {
      result = result.filter(m => m.departmentId === data.filters.departmentId);
    }
    if (data.filters.workLocationId) {
      result = result.filter(m => m.workLocationId === data.filters.workLocationId);
    }
    
    return result;
  }, [teamMembers, data.filters]);

  // Get selected employees
  const selectedEmployees = useMemo(() => {
    return teamMembers.filter(m => data.selectedEmployeeIds.includes(m.id));
  }, [teamMembers, data.selectedEmployeeIds]);

  // Check if any selected employees are subject to GOSI
  const hasGosiEmployees = useMemo(() => {
    return selectedEmployees.some(e => e.isSubjectToGosi);
  }, [selectedEmployees]);

  // Calculate new salary based on update type
  const calculateNewSalary = useCallback((currentSalary: number, updateType: UpdateType | null, updateValue: number, employeeId?: string): number => {
    if (!updateType) return currentSalary;
    
    switch (updateType) {
      case 'percentage_increase':
        return currentSalary * (1 + updateValue / 100);
      case 'percentage_decrease':
        return currentSalary * (1 - updateValue / 100);
      case 'fixed_increase':
        return currentSalary + updateValue;
      case 'fixed_decrease':
        return Math.max(0, currentSalary - updateValue);
      case 'set_new':
        // For set_new, use per-employee salaries
        if (employeeId && data.perEmployeeSalaries[employeeId]) {
          return parseFloat(data.perEmployeeSalaries[employeeId]) || currentSalary;
        }
        return currentSalary;
      default:
        return currentSalary;
    }
  }, [data.perEmployeeSalaries]);

  // Calculate employee impact
  const calculateEmployeeImpacts = useMemo((): EmployeeImpact[] => {
    const updateValue = data.updateType === 'set_new' ? 0 : (parseFloat(data.updateValue) || 0);
    
    return selectedEmployees.map(employee => {
      const beforeBasicSalary = employee.salary || 0;
      const afterBasicSalary = calculateNewSalary(beforeBasicSalary, data.updateType, updateValue, employee.id);
      
      // Get per-employee allowances
      const employeeAllowances = data.perEmployeeAllowances[employee.id] || [];
      const employeeDeductions = data.perEmployeeDeductions[employee.id] || [];
      
      // Calculate before allowances (sum of existing items at original amounts)
      let beforeAllowances = 0;
      let afterAllowances = 0;
      
      employeeAllowances.forEach(a => {
        if (a.isExisting && a.originalAmount !== undefined) {
          beforeAllowances += a.originalAmount;
        }
        afterAllowances += a.amount;
      });
      
      // Calculate deductions
      let beforeDeductions = 0;
      let afterDeductions = 0;
      
      employeeDeductions.forEach(d => {
        if (d.isExisting && d.originalAmount !== undefined) {
          beforeDeductions += d.originalAmount;
        }
        afterDeductions += d.amount;
      });
      
      // GOSI calculations
      const beforeGosiSalary = employee.gosiRegisteredSalary || null;
      let afterGosiSalary = beforeGosiSalary;
      
      if (employee.isSubjectToGosi) {
        if (data.gosiHandling === 'per_employee') {
          afterGosiSalary = parseFloat(data.gosiPerEmployee[employee.id]) || beforeGosiSalary;
        }
      }
      
      const beforeGosiDeduction = beforeGosiSalary ? beforeGosiSalary * 0.08 : 0;
      const afterGosiDeduction = afterGosiSalary ? afterGosiSalary * 0.08 : 0;
      
      // Add GOSI to deductions if applicable
      if (employee.isSubjectToGosi) {
        beforeDeductions += beforeGosiDeduction;
        afterDeductions += afterGosiDeduction;
      }
      
      return {
        employee: employee as TeamMemberWithGosi,
        beforeBasicSalary,
        afterBasicSalary,
        beforeAllowances,
        afterAllowances,
        beforeDeductions,
        afterDeductions,
        beforeNetSalary: beforeBasicSalary + beforeAllowances - beforeDeductions,
        afterNetSalary: afterBasicSalary + afterAllowances - afterDeductions,
        beforeGosiSalary,
        afterGosiSalary,
        beforeGosiDeduction,
        afterGosiDeduction,
      };
    });
  }, [selectedEmployees, data, calculateNewSalary]);

  // Totals
  const totals = useMemo(() => {
    return calculateEmployeeImpacts.reduce(
      (acc, impact) => ({
        beforeTotal: acc.beforeTotal + impact.beforeBasicSalary,
        afterTotal: acc.afterTotal + impact.afterBasicSalary,
        change: acc.change + (impact.afterBasicSalary - impact.beforeBasicSalary),
      }),
      { beforeTotal: 0, afterTotal: 0, change: 0 }
    );
  }, [calculateEmployeeImpacts]);

  // Validation
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return data.selectedEmployeeIds.length > 0;
      case 2:
        if (data.updateType === null) return false;
        if (data.updateType === 'set_new') {
          // For set_new, all selected employees must have a salary set
          return selectedEmployees.every(e => data.perEmployeeSalaries[e.id] && data.perEmployeeSalaries[e.id] !== '');
        }
        return data.updateValue !== '';
      case 3:
        return true; // Components are optional
      case 4:
        // Validate GOSI salary is set for GOSI employees if updating
        if (data.gosiHandling === 'per_employee') {
          const gosiEmployees = selectedEmployees.filter(e => e.isSubjectToGosi);
          return gosiEmployees.every(e => data.gosiPerEmployee[e.id]);
        }
        return true;
      case 5:
        return data.effectiveDate !== null;
      case 6:
        return true; // Review step
      case 7:
        return data.reason.trim() !== '';
      case 8:
        return data.confirmed;
      default:
        return true;
    }
  }, [data, selectedEmployees]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("User not authenticated");

      const impacts = calculateEmployeeImpacts;
      const effectiveDate = data.effectiveDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

      // Create batch record
      const batchInsert: TablesInsert<'salary_update_batches'> = {
        initiated_by: userData.user.id,
        effective_date: effectiveDate,
        filter_criteria: data.filters as any,
        employee_ids: data.selectedEmployeeIds,
        employee_count: data.selectedEmployeeIds.length,
        update_type: data.updateType || 'set_new',
        update_value: parseFloat(data.updateValue) || 0,
        components_changed: {
          perEmployeeAllowances: data.perEmployeeAllowances,
          perEmployeeDeductions: data.perEmployeeDeductions,
        } as any,
        gosi_salary_changed: data.gosiHandling !== 'keep',
        total_before_salary: totals.beforeTotal,
        total_after_salary: totals.afterTotal,
        total_change: totals.change,
        change_type: data.changeType,
        reason: data.reason,
        notes: data.notes || null,
      };

      const { data: batch, error: batchError } = await supabase
        .from('salary_update_batches')
        .insert(batchInsert)
        .select()
        .single();

      if (batchError) throw batchError;

      // Create batch employee records and update employees
      for (const impact of impacts) {
        // Create batch employee record
        await supabase.from('salary_update_batch_employees').insert({
          batch_id: batch.id,
          employee_id: impact.employee.id,
          before_basic_salary: impact.beforeBasicSalary,
          before_total_allowances: impact.beforeAllowances,
          before_total_deductions: impact.beforeDeductions,
          before_net_salary: impact.beforeNetSalary,
          before_gosi_registered_salary: impact.beforeGosiSalary,
          before_gosi_deduction: impact.beforeGosiDeduction,
          after_basic_salary: impact.afterBasicSalary,
          after_total_allowances: impact.afterAllowances,
          after_total_deductions: impact.afterDeductions,
          after_net_salary: impact.afterNetSalary,
          after_gosi_registered_salary: impact.afterGosiSalary,
          after_gosi_deduction: impact.afterGosiDeduction,
        });

        // Update employee salary
        const updateData: Record<string, any> = {
          salary: impact.afterBasicSalary,
        };
        
        if (impact.afterGosiSalary !== impact.beforeGosiSalary) {
          updateData.gosi_registered_salary = impact.afterGosiSalary;
        }

        await supabase
          .from('employees')
          .update(updateData)
          .eq('id', impact.employee.id);

        // Create salary history record
        await supabase.from('salary_history').insert({
          employee_id: impact.employee.id,
          previous_salary: impact.beforeBasicSalary,
          new_salary: impact.afterBasicSalary,
          change_type: data.changeType,
          reason: data.reason,
          effective_date: effectiveDate,
          changed_by: userData.user.id,
        });

        // Get per-employee allowances and deductions
        const employeeAllowances = data.perEmployeeAllowances[impact.employee.id] || [];
        const employeeDeductions = data.perEmployeeDeductions[impact.employee.id] || [];

        // Delete existing allowances/deductions for this employee and insert updated ones
        await supabase.from('employee_allowances').delete().eq('employee_id', impact.employee.id);
        await supabase.from('employee_deductions').delete().eq('employee_id', impact.employee.id);

        // Add allowances
        for (const allowance of employeeAllowances) {
          await supabase.from('employee_allowances').insert({
            employee_id: impact.employee.id,
            allowance_template_id: allowance.isCustom ? null : allowance.templateId,
            custom_name: allowance.isCustom ? allowance.customName : null,
            custom_amount: allowance.amount,
            effective_date: effectiveDate,
          });
        }

        // Add deductions
        for (const deduction of employeeDeductions) {
          await supabase.from('employee_deductions').insert({
            employee_id: impact.employee.id,
            deduction_template_id: deduction.isCustom ? null : deduction.templateId,
            custom_name: deduction.isCustom ? deduction.customName : null,
            custom_amount: deduction.amount,
            effective_date: effectiveDate,
          });
        }
      }

      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['salary-history'] });
    },
  });

  return {
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
    submit: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
