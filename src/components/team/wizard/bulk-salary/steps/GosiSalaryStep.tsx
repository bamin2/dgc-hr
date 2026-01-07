import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info } from "lucide-react";
import { TeamMemberWithGosi } from "@/hooks/useBulkSalaryWizard";
import { BulkSalaryWizardData, GosiHandling } from "../types";

interface GosiSalaryStepProps {
  data: BulkSalaryWizardData;
  gosiEmployees: TeamMemberWithGosi[];
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

export function GosiSalaryStep({ data, gosiEmployees, onUpdateData }: GosiSalaryStepProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
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

  const calculateGosiDeduction = (salary: number | string | undefined) => {
    const amount = typeof salary === 'string' ? parseFloat(salary) : salary;
    if (!amount) return 0;
    return amount * 0.08;
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
          GOSI registered salary may differ from actual salary and typically updates annually (Jan 1).
          This wizard will not auto-change it unless you choose to. The GOSI deduction is calculated
          as 8% of the GOSI registered salary.
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
            data.gosiHandling === 'set_single' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
          }`}
          onClick={() => onUpdateData('gosiHandling', 'set_single')}
        >
          <CardContent className="flex items-start gap-4 p-4">
            <RadioGroupItem value="set_single" id="set_single" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="set_single" className="font-medium cursor-pointer">
                Set new GOSI registered salary for all
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Apply the same GOSI registered salary to all selected GOSI employees
              </p>
              {data.gosiHandling === 'set_single' && (
                <div className="space-y-2">
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter GOSI registered salary"
                      value={data.gosiNewValue}
                      onChange={(e) => onUpdateData('gosiNewValue', e.target.value)}
                      className="pl-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {data.gosiNewValue && (
                    <p className="text-sm text-muted-foreground">
                      GOSI deduction: {formatCurrency(calculateGosiDeduction(data.gosiNewValue))} / month
                    </p>
                  )}
                </div>
              )}
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
              {gosiEmployees.map(employee => (
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
                      Current: {formatCurrency(employee.gosiRegisteredSalary)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="New GOSI salary"
                        value={data.gosiPerEmployee[employee.id] || ''}
                        onChange={(e) => handlePerEmployeeChange(employee.id, e.target.value)}
                        className="pl-7 h-9"
                      />
                    </div>
                    {data.gosiPerEmployee[employee.id] && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        = {formatCurrency(calculateGosiDeduction(data.gosiPerEmployee[employee.id]))} deduction
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Current GOSI salaries summary */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Current GOSI Summary</Label>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">GOSI Employees</p>
                <p className="text-lg font-semibold">{gosiEmployees.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Current GOSI Salaries</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(gosiEmployees.reduce((sum, e) => sum + (e.gosiRegisteredSalary || 0), 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Current GOSI Deductions</p>
                <p className="text-lg font-semibold text-destructive">
                  {formatCurrency(gosiEmployees.reduce((sum, e) => sum + calculateGosiDeduction(e.gosiRegisteredSalary), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
