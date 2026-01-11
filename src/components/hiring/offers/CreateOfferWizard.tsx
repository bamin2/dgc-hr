import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { usePositionsManagement } from "@/hooks/usePositionsManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateOfferWithDetails, type CreateOfferData } from "@/hooks/useOffers";
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
    housing_allowance: 0,
    transport_allowance: 0,
    other_allowances: 0,
    deductions_fixed: 0,
  });

  const { data: departments } = useDepartmentsManagement();
  const { data: workLocations } = useWorkLocations();
  const { data: positions } = usePositionsManagement();
  const { data: employees } = useEmployees();
  const createOffer = useCreateOfferWithDetails();

  // Calculated values
  const grossTotal = (formData.basic_salary || 0) + 
    (formData.housing_allowance || 0) + 
    (formData.transport_allowance || 0) + 
    (formData.other_allowances || 0);
  
  const gosiAmount = (formData.basic_salary || 0) * 0.0975; // 9.75% employee GOSI
  const netEstimate = grossTotal - (formData.deductions_fixed || 0) - gosiAmount;

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

  const handleSubmit = async () => {
    const offer = await createOffer.mutateAsync(formData as CreateOfferData);
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

  return (
    <div className="flex flex-col h-full">
      {/* Candidate Header */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <h3 className="font-semibold text-lg">{candidate.first_name} {candidate.last_name}</h3>
        <p className="text-sm text-muted-foreground">{candidate.email}</p>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b">
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
      <div className="flex-1 overflow-y-auto px-6 py-6">
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
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="BHD">BHD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Basic Salary *</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.basic_salary || ""}
                  onChange={(e) => updateField("basic_salary", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Allowances</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Housing Allowance</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.housing_allowance || ""}
                    onChange={(e) => updateField("housing_allowance", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transport Allowance</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.transport_allowance || ""}
                    onChange={(e) => updateField("transport_allowance", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Other Allowances</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.other_allowances || ""}
                  onChange={(e) => updateField("other_allowances", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Deductions</h4>
              <div className="space-y-2">
                <Label>Fixed Deductions</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.deductions_fixed || ""}
                  onChange={(e) => updateField("deductions_fixed", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Separator />

            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross Total</span>
                  <span className="font-medium">{formData.currency_code} {grossTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GOSI (9.75%)</span>
                  <span className="text-destructive">- {gosiAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fixed Deductions</span>
                  <span className="text-destructive">- {(formData.deductions_fixed || 0).toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Net Estimate</span>
                  <span>{formData.currency_code} {netEstimate.toLocaleString()}</span>
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
                  <span>{formData.currency_code} {(formData.basic_salary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Housing Allowance</span>
                  <span>{formData.currency_code} {(formData.housing_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transport Allowance</span>
                  <span>{formData.currency_code} {(formData.transport_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Allowances</span>
                  <span>{formData.currency_code} {(formData.other_allowances || 0).toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Gross Total</span>
                  <span>{formData.currency_code} {grossTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span className="text-muted-foreground">Deductions</span>
                  <span>- {(gosiAmount + (formData.deductions_fixed || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2">
                  <span>Net Estimate</span>
                  <span>{formData.currency_code} {netEstimate.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t flex justify-between">
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
    </div>
  );
}
