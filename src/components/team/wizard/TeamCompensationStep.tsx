import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayFrequency } from "@/data/team";

export interface TeamCompensationData {
  employeeType: string;
  salary: string;
  payFrequency: PayFrequency;
  employmentStatus: string;
  taxExemptionStatus: string;
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

const taxStatuses = [
  "W-2 Employee",
  "1099 Contractor",
  "Exempt",
  "Non-Exempt",
];

export function TeamCompensationStep({
  data,
  onChange,
  workerType,
}: TeamCompensationStepProps) {
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

      {/* Tax Exemption Status */}
      <div className="space-y-2">
        <Label>Special tax exemption status</Label>
        <Select
          value={data.taxExemptionStatus}
          onValueChange={(value) => updateField("taxExemptionStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {taxStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
