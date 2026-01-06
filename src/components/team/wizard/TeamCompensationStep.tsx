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
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencyByCode } from "@/data/currencies";

export interface TeamCompensationData {
  salary: string;
  currency: string;
  employmentStatus: "full_time" | "part_time";
  selectedAllowances: string[];
  selectedDeductions: string[];
}

interface TeamCompensationStepProps {
  data: TeamCompensationData;
  onChange: (data: TeamCompensationData) => void;
  workLocationId: string;
}

export function TeamCompensationStep({
  data,
  onChange,
  workLocationId,
}: TeamCompensationStepProps) {
  const { data: allowanceTemplates, isLoading: loadingAllowances } = useActiveAllowanceTemplates();
  const { data: deductionTemplates, isLoading: loadingDeductions } = useActiveDeductionTemplates();
  const { data: workLocations } = useWorkLocations();

  const updateField = <K extends keyof TeamCompensationData>(
    field: K,
    value: TeamCompensationData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Get currency from work location
  const workLocation = workLocations?.find(w => w.id === workLocationId);
  const currency = getCurrencyByCode(data.currency) || getCurrencyByCode("USD");

  const allowanceOptions = (allowanceTemplates || []).map(t => ({
    value: t.id,
    label: t.name,
    description: t.amount_type === 'fixed' 
      ? `${currency?.symbol || "$"}${t.amount.toLocaleString()}`
      : `${t.amount}% of ${t.percentage_of?.replace('_', ' ')}`,
  }));

  const deductionOptions = (deductionTemplates || []).map(t => ({
    value: t.id,
    label: t.name,
    description: t.amount_type === 'fixed' 
      ? `${currency?.symbol || "$"}${t.amount.toLocaleString()}`
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

      {/* Salary */}
      <div className="space-y-2">
        <Label>Salary *</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {currency?.symbol || "$"}
            </span>
            <Input
              type="text"
              placeholder="0.00"
              value={data.salary}
              onChange={(e) => updateField("salary", e.target.value)}
              className="pl-10"
            />
          </div>
          <span className="text-muted-foreground whitespace-nowrap">/ month</span>
        </div>
        {workLocation && (
          <p className="text-xs text-muted-foreground">
            Currency based on {workLocation.name} ({data.currency})
          </p>
        )}
      </div>

      {/* Employment Status */}
      <div className="space-y-2">
        <Label>Employment status *</Label>
        <Select
          value={data.employmentStatus}
          onValueChange={(value) =>
            updateField("employmentStatus", value as "full_time" | "part_time")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_time">Full-Time</SelectItem>
            <SelectItem value="part_time">Part-Time</SelectItem>
          </SelectContent>
        </Select>
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
          All active allowances are pre-selected. You can modify as needed.
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
          All active deductions are pre-selected. You can modify as needed.
        </p>
      </div>
    </div>
  );
}
