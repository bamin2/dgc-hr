import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { useActiveAllowanceTemplates } from "@/hooks/useAllowanceTemplates";
import { useActiveDeductionTemplates } from "@/hooks/useDeductionTemplates";
import { PayFrequency } from "@/data/team";
import { Skeleton } from "@/components/ui/skeleton";

export interface TeamCompensationData {
  employeeType: string;
  salary: string;
  payFrequency: PayFrequency;
  employmentStatus: string;
  selectedAllowances: string[];
  selectedDeductions: string[];
}

interface TeamCompensationStepProps {
  data: TeamCompensationData;
  onChange: (data: TeamCompensationData) => void;
  workerType: string;
}

const employeeTypes = [
  "Software Engineer",
  "Designer",
  "Product Manager",
  "Marketing Specialist",
  "Sales Representative",
  "HR Specialist",
  "Financial Analyst",
  "Operations Manager",
];

export function TeamCompensationStep({
  data,
  onChange,
  workerType,
}: TeamCompensationStepProps) {
  const { data: allowanceTemplates, isLoading: loadingAllowances } = useActiveAllowanceTemplates();
  const { data: deductionTemplates, isLoading: loadingDeductions } = useActiveDeductionTemplates();

  const updateField = <K extends keyof TeamCompensationData>(
    field: K,
    value: TeamCompensationData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const getEmploymentStatus = () => {
    switch (workerType) {
      case "employee":
        return "Full-time Employee";
      case "contractor_individual":
        return "Independent Contractor";
      case "contractor_business":
        return "Business Contractor";
      default:
        return "Employee";
    }
  };

  const allowanceOptions = (allowanceTemplates || []).map(t => ({
    value: t.id,
    label: t.name,
    description: t.amount_type === 'fixed' 
      ? `$${t.amount.toLocaleString()}`
      : `${t.amount}% of ${t.percentage_of?.replace('_', ' ')}`,
  }));

  const deductionOptions = (deductionTemplates || []).map(t => ({
    value: t.id,
    label: t.name,
    description: t.amount_type === 'fixed' 
      ? `$${t.amount.toLocaleString()}`
      : `${t.amount}% of ${t.percentage_of?.replace('_', ' ')}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Compensation details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up salary and payment information
        </p>
      </div>

      {/* Employee Type */}
      <div className="space-y-2">
        <Label>Employee type</Label>
        <Select
          value={data.employeeType}
          onValueChange={(value) => updateField("employeeType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {employeeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Salary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              type="text"
              placeholder="0.00"
              value={data.salary}
              onChange={(e) => updateField("salary", e.target.value)}
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Per</Label>
          <Select
            value={data.payFrequency}
            onValueChange={(value) =>
              updateField("payFrequency", value as PayFrequency)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employment Status (Read-only) */}
      <div className="space-y-2">
        <Label>Employment status</Label>
        <Input
          value={getEmploymentStatus()}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Based on worker type selection
        </p>
      </div>

      {/* Allowances */}
      <div className="space-y-2">
        <Label>Allowances</Label>
        {loadingAllowances ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <MultiSelect
            options={allowanceOptions}
            selected={data.selectedAllowances}
            onChange={(selected) => updateField("selectedAllowances", selected)}
            placeholder="Select allowances..."
            emptyMessage="No allowance templates available. Create them in Settings."
          />
        )}
        <p className="text-xs text-muted-foreground">
          Add allowances that will be included in this employee's payroll
        </p>
      </div>

      {/* Deductions */}
      <div className="space-y-2">
        <Label>Deductions</Label>
        {loadingDeductions ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <MultiSelect
            options={deductionOptions}
            selected={data.selectedDeductions}
            onChange={(selected) => updateField("selectedDeductions", selected)}
            placeholder="Select deductions..."
            emptyMessage="No deduction templates available. Create them in Settings."
          />
        )}
        <p className="text-xs text-muted-foreground">
          Add deductions that will be applied during payroll processing
        </p>
      </div>
    </div>
  );
}
