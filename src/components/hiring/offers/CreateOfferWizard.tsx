import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Loader2, Plus, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { usePositionsManagement } from "@/hooks/usePositionsManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateOfferWithDetails, type CreateOfferData } from "@/hooks/useOffers";
import { AddAllowanceDialog, type AllowanceEntry } from "@/components/team/wizard/AddAllowanceDialog";
import { AddDeductionDialog, type DeductionEntry } from "@/components/team/wizard/AddDeductionDialog";
import { useActiveAllowanceTemplatesByLocation } from "@/hooks/useAllowanceTemplates";
import { useActiveDeductionTemplatesByLocation } from "@/hooks/useDeductionTemplates";
import { getCurrencyByCode } from "@/data/currencies";
import { getCountryCodeByName } from "@/data/countries";
import type { Candidate } from "@/hooks/useCandidates";

interface CreateOfferWizardProps {
  candidate: Candidate;
  onSuccess: (offerId: string) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: "Job Details" },
  { id: 2, title: "Compensation" },
  { id: 3, title: "Review" },
];

export function CreateOfferWizard({ candidate, onSuccess, onCancel }: CreateOfferWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [dateOpen, setDateOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateOfferData>>({
    candidateId: candidate.id,
    currency_code: "SAR",
    basic_salary: 0,
  });

  // Dynamic allowances and deductions
  const [allowances, setAllowances] = useState<AllowanceEntry[]>([]);
  const [deductions, setDeductions] = useState<DeductionEntry[]>([]);
  const [isSubjectToGosi, setIsSubjectToGosi] = useState(false);
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);

  const { data: departments } = useDepartmentsManagement();
  const { data: workLocations } = useWorkLocations();
  const { data: positions } = usePositionsManagement();
  const { data: employees } = useEmployees();
  const { data: allowanceTemplates } = useActiveAllowanceTemplatesByLocation(formData.work_location_id || null);
  const { data: deductionTemplates } = useActiveDeductionTemplatesByLocation(formData.work_location_id || null);
  const createOffer = useCreateOfferWithDetails();

  const selectedWorkLocation = workLocations?.find(l => l.id === formData.work_location_id);
  const currencyInfo = getCurrencyByCode(formData.currency_code || "SAR");

  // Auto-set currency when work location changes
  useEffect(() => {
    if (formData.work_location_id && workLocations) {
      const location = workLocations.find(l => l.id === formData.work_location_id);
      if (location?.currency) {
        setFormData(prev => ({ ...prev, currency_code: location.currency }));
      }
    }
  }, [formData.work_location_id, workLocations]);

  // Calculate allowances first (needed for GOSI calculation)
  const allowancesTotal = useMemo(() => {
    return allowances.reduce((sum, a) => {
      if (a.isPercentage && a.percentageOf === 'basic_salary') {
        return sum + ((formData.basic_salary || 0) * a.amount / 100);
      }
      return sum + a.amount;
    }, 0);
  }, [allowances, formData.basic_salary]);

  // Calculate GOSI based on work location rates and candidate nationality
  // GOSI base = Basic Salary + All Allowances
  const gosiCalculation = useMemo(() => {
    if (!isSubjectToGosi || !selectedWorkLocation?.gosi_enabled) {
      return { employeeAmount: 0, employerAmount: 0, rate: 0, base: 0 };
    }

    const nationalityCode = getCountryCodeByName(candidate.nationality || '');
    const rates = selectedWorkLocation.gosi_nationality_rates || [];
    const matchingRate = rates.find(r => r.nationality === nationalityCode);

    if (matchingRate) {
      const gosiBase = (formData.basic_salary || 0) + allowancesTotal;
      return {
        employeeAmount: (gosiBase * matchingRate.employeeRate) / 100,
        employerAmount: (gosiBase * matchingRate.employerRate) / 100,
        rate: matchingRate.employeeRate,
        base: gosiBase,
      };
    }
    return { employeeAmount: 0, employerAmount: 0, rate: 0, base: 0 };
  }, [isSubjectToGosi, selectedWorkLocation, formData.basic_salary, allowancesTotal, candidate.nationality]);

  // Calculate totals

  const deductionsTotal = useMemo(() => {
    return deductions.reduce((sum, d) => {
      if (d.isPercentage && d.percentageOf === 'basic_salary') {
        return sum + ((formData.basic_salary || 0) * d.amount / 100);
      }
      return sum + d.amount;
    }, 0);
  }, [deductions, formData.basic_salary]);

  const grossTotal = (formData.basic_salary || 0) + allowancesTotal;
  const totalDeductions = deductionsTotal + gosiCalculation.employeeAmount;
  const netEstimate = grossTotal - totalDeductions;

  const updateField = <K extends keyof CreateOfferData>(field: K, value: CreateOfferData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = formData.work_location_id && formData.department_id && 
    formData.position_id && formData.start_date;

  const canProceedStep2 = (formData.basic_salary || 0) > 0;

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleAddAllowance = (allowance: AllowanceEntry) => {
    setAllowances(prev => [...prev, allowance]);
  };

  const handleRemoveAllowance = (id: string) => {
    setAllowances(prev => prev.filter(a => a.id !== id));
  };

  const handleAddDeduction = (deduction: DeductionEntry) => {
    setDeductions(prev => [...prev, deduction]);
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = async () => {
    // Prepare offer data with calculated values
    const offerData: CreateOfferData = {
      candidateId: candidate.id,
      work_location_id: formData.work_location_id!,
      department_id: formData.department_id!,
      position_id: formData.position_id!,
      manager_employee_id: formData.manager_employee_id,
      start_date: formData.start_date!,
      currency_code: formData.currency_code || "SAR",
      basic_salary: formData.basic_salary || 0,
      housing_allowance: 0, // We'll use the allowances array instead
      transport_allowance: 0,
      other_allowances: allowancesTotal,
      deductions_fixed: totalDeductions,
      is_subject_to_gosi: isSubjectToGosi,
      gosi_employee_amount: gosiCalculation.employeeAmount,
      gosi_employer_amount: gosiCalculation.employerAmount,
      allowances,
      deductions,
    };

    const offer = await createOffer.mutateAsync(offerData);
    onSuccess(offer.id);
  };

  // Get display names for review
  const getLocationName = () => workLocations?.find(l => l.id === formData.work_location_id)?.name || "-";
  const getDepartmentName = () => departments?.find(d => d.id === formData.department_id)?.name || "-";
  const getPositionName = () => positions?.find(p => p.id === formData.position_id)?.title || "-";
  const getManagerName = () => {
    const mgr = employees?.find(e => e.id === formData.manager_employee_id);
    return mgr ? `${mgr.firstName} ${mgr.lastName}` : "-";
  };

  const getAllowanceName = (allowance: AllowanceEntry) => {
    if (allowance.isCustom) return allowance.customName || "Custom Allowance";
    const template = allowanceTemplates?.find(t => t.id === allowance.templateId);
    return template?.name || "Unknown Allowance";
  };

  const getDeductionName = (deduction: DeductionEntry) => {
    if (deduction.isCustom) return deduction.customName || "Custom Deduction";
    const template = deductionTemplates?.find(t => t.id === deduction.templateId);
    return template?.name || "Unknown Deduction";
  };

  const formatAmount = (amount: number) => {
    return `${currencyInfo?.symbol || formData.currency_code} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Candidate Header */}
      <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
        <h3 className="font-semibold text-lg">{candidate.first_name} {candidate.last_name}</h3>
        <p className="text-sm text-muted-foreground">{candidate.email}</p>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                  currentStep === step.id 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className={cn(
                  "text-sm font-medium hidden sm:inline",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Work Location *</Label>
              <Select 
                value={formData.work_location_id || ""} 
                onValueChange={(v) => updateField("work_location_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work location" />
                </SelectTrigger>
                <SelectContent>
                  {workLocations?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department *</Label>
              <Select 
                value={formData.department_id || ""} 
                onValueChange={(v) => updateField("department_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position *</Label>
              <Select 
                value={formData.position_id || ""} 
                onValueChange={(v) => updateField("position_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Manager</Label>
              <Select 
                value={formData.manager_employee_id || ""} 
                onValueChange={(v) => updateField("manager_employee_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proposed Start Date *</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date
                      ? format(new Date(formData.start_date), "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={(date) => {
                      updateField("start_date", date ? format(date, "yyyy-MM-dd") : undefined);
                      setDateOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Currency and Basic Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={formData.currency_code || "SAR"} 
                  onValueChange={(v) => updateField("currency_code", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    <SelectItem value="BHD">BHD - Bahraini Dinar</SelectItem>
                    <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                    <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
                    <SelectItem value="OMR">OMR - Omani Rial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Basic Salary *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {currencyInfo?.symbol || formData.currency_code}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={formData.basic_salary || ""}
                    onChange={(e) => updateField("basic_salary", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-12"
                  />
                </div>
              </div>
            </div>

            {/* GOSI Toggle */}
            <Card className={cn(
              "transition-colors",
              isSubjectToGosi && selectedWorkLocation?.gosi_enabled ? "border-primary/50 bg-primary/5" : ""
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gosi-toggle" className="font-medium">Subject to GOSI</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>GOSI (General Organization for Social Insurance) deductions will be calculated based on the work location's configured rates for {candidate.nationality || "the candidate's nationality"}.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch
                    id="gosi-toggle"
                    checked={isSubjectToGosi}
                    onCheckedChange={setIsSubjectToGosi}
                    disabled={!selectedWorkLocation?.gosi_enabled}
                  />
                </div>
                {!selectedWorkLocation?.gosi_enabled && formData.work_location_id && (
                  <p className="text-xs text-muted-foreground mt-2">
                    GOSI is not enabled for this work location
                  </p>
                )}
                {isSubjectToGosi && gosiCalculation.rate > 0 && (
                  <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employee Rate ({gosiCalculation.rate}%)</span>
                      <span className="font-medium text-destructive">-{formatAmount(gosiCalculation.employeeAmount)}</span>
                    </div>
                  </div>
                )}
                {isSubjectToGosi && gosiCalculation.rate === 0 && candidate.nationality && (
                  <p className="text-xs text-amber-600 mt-2">
                    No GOSI rate configured for nationality: {candidate.nationality}
                  </p>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Allowances */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Allowances</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllowanceDialog(true)}
                  disabled={!formData.work_location_id}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Allowance
                </Button>
              </div>

              {allowances.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                  No allowances added
                </div>
              ) : (
                <div className="space-y-2">
                  {allowances.map((allowance) => {
                    const displayAmount = allowance.isPercentage && allowance.percentageOf === 'basic_salary'
                      ? (formData.basic_salary || 0) * allowance.amount / 100
                      : allowance.amount;
                    return (
                      <div key={allowance.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium text-sm">{getAllowanceName(allowance)}</span>
                          {allowance.isPercentage && (
                            <span className="text-xs text-muted-foreground ml-2">({allowance.amount}%)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatAmount(displayAmount)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveAllowance(allowance.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">Total Allowances</span>
                    <span className="font-medium">{formatAmount(allowancesTotal)}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Deductions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Deductions</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeductionDialog(true)}
                  disabled={!formData.work_location_id}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Deduction
                </Button>
              </div>

              <div className="space-y-2">
                {/* GOSI deduction (if applicable) */}
                {isSubjectToGosi && gosiCalculation.employeeAmount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                    <div>
                      <span className="font-medium text-sm">GOSI (Employee)</span>
                      <span className="text-xs text-muted-foreground ml-2">({gosiCalculation.rate}%)</span>
                      <span className="text-xs text-primary ml-2">(statutory)</span>
                    </div>
                    <span className="text-sm font-medium text-destructive">-{formatAmount(gosiCalculation.employeeAmount)}</span>
                  </div>
                )}

                {deductions.map((deduction) => {
                  const displayAmount = deduction.isPercentage && deduction.percentageOf === 'basic_salary'
                    ? (formData.basic_salary || 0) * deduction.amount / 100
                    : deduction.amount;
                  return (
                    <div key={deduction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">{getDeductionName(deduction)}</span>
                        {deduction.isPercentage && (
                          <span className="text-xs text-muted-foreground ml-2">({deduction.amount}%)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-destructive">-{formatAmount(displayAmount)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveDeduction(deduction.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {deductions.length === 0 && !isSubjectToGosi && (
                  <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                    No deductions added
                  </div>
                )}

                {(deductions.length > 0 || gosiCalculation.employeeAmount > 0) && (
                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-muted-foreground">Total Deductions</span>
                    <span className="font-medium text-destructive">-{formatAmount(totalDeductions)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Summary Card */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium">{formatAmount(formData.basic_salary || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Allowances</span>
                  <span className="font-medium">+{formatAmount(allowancesTotal)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Gross Total</span>
                  <span>{formatAmount(grossTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span className="text-muted-foreground">Total Deductions</span>
                  <span>-{formatAmount(totalDeductions)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Net Estimate</span>
                  <span>{formatAmount(netEstimate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Candidate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{candidate.first_name} {candidate.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{candidate.email}</span>
                </div>
                {candidate.nationality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality</span>
                    <span>{candidate.nationality}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Location</span>
                  <span>{getLocationName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{getDepartmentName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span>{getPositionName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manager</span>
                  <span>{getManagerName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>{formData.start_date ? format(new Date(formData.start_date), "PPP") : "-"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span>{formatAmount(formData.basic_salary || 0)}</span>
                </div>
                
                {allowances.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Allowances</div>
                    {allowances.map((allowance) => {
                      const displayAmount = allowance.isPercentage && allowance.percentageOf === 'basic_salary'
                        ? (formData.basic_salary || 0) * allowance.amount / 100
                        : allowance.amount;
                      return (
                        <div key={allowance.id} className="flex justify-between">
                          <span className="text-muted-foreground">{getAllowanceName(allowance)}</span>
                          <span>{formatAmount(displayAmount)}</span>
                        </div>
                      );
                    })}
                  </>
                )}

                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Gross Total</span>
                  <span>{formatAmount(grossTotal)}</span>
                </div>

                {(isSubjectToGosi || deductions.length > 0) && (
                  <>
                    <Separator className="my-2" />
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deductions</div>
                    {isSubjectToGosi && gosiCalculation.employeeAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GOSI ({gosiCalculation.rate}%)</span>
                        <span className="text-destructive">-{formatAmount(gosiCalculation.employeeAmount)}</span>
                      </div>
                    )}
                    {deductions.map((deduction) => {
                      const displayAmount = deduction.isPercentage && deduction.percentageOf === 'basic_salary'
                        ? (formData.basic_salary || 0) * deduction.amount / 100
                        : deduction.amount;
                      return (
                        <div key={deduction.id} className="flex justify-between">
                          <span className="text-muted-foreground">{getDeductionName(deduction)}</span>
                          <span className="text-destructive">-{formatAmount(displayAmount)}</span>
                        </div>
                      );
                    })}
                  </>
                )}

                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Net Estimate</span>
                  <span>{formatAmount(netEstimate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-between shrink-0 sticky bottom-0 bg-background">
        <Button variant="outline" onClick={currentStep === 1 ? onCancel : handleBack}>
          {currentStep === 1 ? "Cancel" : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </>
          )}
        </Button>
        
        {currentStep < 3 ? (
          <Button 
            onClick={handleNext}
            disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createOffer.isPending}>
            {createOffer.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Offer"
            )}
          </Button>
        )}
      </div>

      {/* Dialogs */}
      <AddAllowanceDialog
        open={showAllowanceDialog}
        onOpenChange={setShowAllowanceDialog}
        onAdd={handleAddAllowance}
        currency={formData.currency_code || "SAR"}
        existingTemplateIds={allowances.filter(a => a.templateId).map(a => a.templateId!)}
        workLocationId={formData.work_location_id || null}
      />

      <AddDeductionDialog
        open={showDeductionDialog}
        onOpenChange={setShowDeductionDialog}
        onAdd={handleAddDeduction}
        currency={formData.currency_code || "SAR"}
        existingTemplateIds={deductions.filter(d => d.templateId).map(d => d.templateId!)}
        workLocationId={formData.work_location_id || null}
      />
    </div>
  );
}
