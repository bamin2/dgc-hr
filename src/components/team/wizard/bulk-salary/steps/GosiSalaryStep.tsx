import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TeamMemberWithGosi } from "@/hooks/useBulkSalaryWizard";
import { BulkSalaryWizardData, GosiHandling, AllowanceEntryExtended } from "../types";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { getCountryCodeByName } from "@/data/countries";

interface AllowanceTemplate {
  id: string;
  name: string;
  amount: number;
  amount_type: string;
}

interface GosiSalaryStepProps {
  data: BulkSalaryWizardData;
  gosiEmployees: TeamMemberWithGosi[];
  workLocations: WorkLocation[];
  allowanceTemplates: AllowanceTemplate[];
  currency: string;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

export function GosiSalaryStep({ data, gosiEmployees, workLocations, allowanceTemplates, currency, onUpdateData }: GosiSalaryStepProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const handlePerEmployeeChange = (employeeId: string, value: string) => {
    onUpdateData('gosiPerEmployee', {
      ...data.gosiPerEmployee,
      [employeeId]: value,
    });
  };

  // Get GOSI rate for an employee based on their work location and nationality
  const getGosiRate = (employee: TeamMemberWithGosi): number => {
    const workLocation = workLocations.find(wl => wl.id === employee.workLocationId);
    if (!workLocation?.gosi_enabled) return 0;
    
    const nationalityCode = getCountryCodeByName(employee.nationality || '');
    const rates = (workLocation.gosi_nationality_rates || []) as Array<{nationality: string; percentage: number}>;
    const matchingRate = rates.find(r => r.nationality === nationalityCode);
    
    return matchingRate?.percentage || 0;
  };

  // Get housing allowance for an employee
  const getHousingAllowance = (employeeId: string): number => {
    const employeeAllowances = data.perEmployeeAllowances[employeeId] || [];
    
    // Find housing allowance by template name
    for (const allowance of employeeAllowances) {
      if (allowance.templateId) {
        const template = allowanceTemplates.find(t => t.id === allowance.templateId);
        if (template?.name?.toLowerCase().includes('housing')) {
          return allowance.amount || 0;
        }
      }
      // Check custom name for housing
      if (allowance.customName?.toLowerCase().includes('housing')) {
        return allowance.amount || 0;
      }
    }
    
    return 0;
  };

  // Calculate GOSI base based on work location settings
  const getGosiBase = (employee: TeamMemberWithGosi): number => {
    const workLocation = workLocations.find(wl => wl.id === employee.workLocationId);
    
    if (workLocation?.gosi_base_calculation === 'basic_plus_housing') {
      const basicSalary = employee.salary || 0;
      const housingAllowance = getHousingAllowance(employee.id);
      return basicSalary + housingAllowance;
    }
    
    // Default: use GOSI registered salary
    return employee.gosiRegisteredSalary || 0;
  };

  const calculateGosiDeduction = (salary: number | string | undefined, employee: TeamMemberWithGosi): number => {
    const amount = typeof salary === 'string' ? parseFloat(salary) : salary;
    if (!amount) return 0;
    
    const rate = getGosiRate(employee);
    return (amount * rate) / 100;
  };

  // Calculate before/after totals
  const gosiTotals = useMemo(() => {
    const beforeData = gosiEmployees.reduce((acc, e) => {
      const gosiBase = getGosiBase(e);
      const deduction = calculateGosiDeduction(gosiBase, e);
      return {
        salaries: acc.salaries + gosiBase,
        deductions: acc.deductions + deduction,
      };
    }, { salaries: 0, deductions: 0 });

    const afterData = gosiEmployees.reduce((acc, e) => {
      const currentGosiBase = getGosiBase(e);
      const newSalary = data.gosiHandling === 'per_employee' && data.gosiPerEmployee[e.id]
        ? parseFloat(data.gosiPerEmployee[e.id])
        : currentGosiBase;
      const deduction = calculateGosiDeduction(newSalary, e);
      return {
        salaries: acc.salaries + newSalary,
        deductions: acc.deductions + deduction,
      };
    }, { salaries: 0, deductions: 0 });

    return {
      beforeSalaries: beforeData.salaries,
      afterSalaries: afterData.salaries,
      salaryChange: afterData.salaries - beforeData.salaries,
      beforeDeductions: beforeData.deductions,
      afterDeductions: afterData.deductions,
      deductionChange: afterData.deductions - beforeData.deductions,
    };
  }, [gosiEmployees, data.gosiHandling, data.gosiPerEmployee, workLocations, data.perEmployeeAllowances, allowanceTemplates]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">GOSI Registered Salary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage GOSI registered salaries for employees subject to GOSI
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Showing employees marked as subject to GOSI in their employee profile.
          GOSI registered salary may differ from actual salary and typically updates annually (Jan 1).
          GOSI deduction rates vary by nationality as configured in work location settings.
        </AlertDescription>
      </Alert>

      <RadioGroup
        value={data.gosiHandling}
        onValueChange={(value) => {
          onUpdateData('gosiHandling', value as GosiHandling);
        }}
        className="space-y-3"
      >
        <Card
          className={`cursor-pointer transition-all ${
            data.gosiHandling === 'keep' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
          }`}
          onClick={() => onUpdateData('gosiHandling', 'keep')}
        >
          <CardContent className="flex items-start gap-4 p-4">
            <RadioGroupItem value="keep" id="keep" className="mt-1" />
            <div>
              <Label htmlFor="keep" className="font-medium cursor-pointer">
                Keep current GOSI registered salary
              </Label>
              <p className="text-sm text-muted-foreground">
                No changes will be made to GOSI registered salaries
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            data.gosiHandling === 'per_employee' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
          }`}
          onClick={() => onUpdateData('gosiHandling', 'per_employee')}
        >
          <CardContent className="flex items-start gap-4 p-4">
            <RadioGroupItem value="per_employee" id="per_employee" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="per_employee" className="font-medium cursor-pointer">
                Set per-employee GOSI registered salary
              </Label>
              <p className="text-sm text-muted-foreground">
                Set individual GOSI registered salaries for each employee
              </p>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      {data.gosiHandling === 'per_employee' && (
        <div className="space-y-3">
          <Label className="text-base font-medium">GOSI Employees</Label>
          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="divide-y">
              {gosiEmployees.map(employee => {
                const ratePercentage = getGosiRate(employee);
                const workLocation = workLocations.find(wl => wl.id === employee.workLocationId);
                const gosiBase = getGosiBase(employee);
                const isBasicPlusHousing = workLocation?.gosi_base_calculation === 'basic_plus_housing';
                
                return (
                  <div key={employee.id} className="flex items-center gap-4 px-4 py-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>
                        {getInitials(employee.firstName, employee.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isBasicPlusHousing 
                          ? `Base: ${formatCurrency(gosiBase)} (Basic + Housing)`
                          : `Current: ${formatCurrency(gosiBase)}`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rate: {ratePercentage}% ({employee.nationality || 'No nationality'})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-40">
                        <Input
                          type="number"
                          placeholder={isBasicPlusHousing ? "Override amount" : "New GOSI salary"}
                          value={data.gosiPerEmployee[employee.id] || ''}
                          onChange={(e) => handlePerEmployeeChange(employee.id, e.target.value)}
                          className="h-9"
                        />
                      </div>
                      {(data.gosiPerEmployee[employee.id] || isBasicPlusHousing) && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          = {formatCurrency(calculateGosiDeduction(
                            data.gosiPerEmployee[employee.id] || gosiBase, 
                            employee
                          ))} deduction
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          {gosiEmployees.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {Object.keys(data.gosiPerEmployee).filter(id => data.gosiPerEmployee[id]).length} of {gosiEmployees.length} employees have new GOSI salaries set
            </p>
          )}
        </div>
      )}

      {/* GOSI Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GOSI Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div></div>
              <div className="text-right">Before</div>
              <div className="text-right">After</div>
              <div className="text-right">Change</div>
            </div>

            {/* GOSI Salaries Row */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium">GOSI Registered Salaries</div>
              <div className="text-right text-sm">{formatCurrency(gosiTotals.beforeSalaries)}</div>
              <div className="text-right text-sm font-medium">{formatCurrency(gosiTotals.afterSalaries)}</div>
              <div className={`text-right text-sm font-medium flex items-center justify-end gap-1 ${getChangeColor(gosiTotals.salaryChange)}`}>
                {getChangeIcon(gosiTotals.salaryChange)}
                {gosiTotals.salaryChange >= 0 ? '+' : ''}{formatCurrency(gosiTotals.salaryChange)}
              </div>
            </div>

            {/* GOSI Deductions Row */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium">
                <span>GOSI Deductions</span>
                <p className="text-xs text-muted-foreground font-normal">(Rates vary by nationality)</p>
              </div>
              <div className="text-right text-sm">{formatCurrency(gosiTotals.beforeDeductions)}</div>
              <div className="text-right text-sm font-medium">{formatCurrency(gosiTotals.afterDeductions)}</div>
              <div className={`text-right text-sm font-medium flex items-center justify-end gap-1 ${getChangeColor(gosiTotals.deductionChange)}`}>
                {getChangeIcon(gosiTotals.deductionChange)}
                {gosiTotals.deductionChange >= 0 ? '+' : ''}{formatCurrency(gosiTotals.deductionChange)}
              </div>
            </div>

            {/* Employee Count */}
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Employees subject to GOSI: <span className="font-medium text-foreground">{gosiEmployees.length}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
