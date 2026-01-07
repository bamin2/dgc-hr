import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Users, Calendar, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { BulkSalaryWizardData } from "../types";

interface ConfirmApplyStepProps {
  data: BulkSalaryWizardData;
  employeeCount: number;
  totalChange: number;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

export function ConfirmApplyStep({ data, employeeCount, totalChange, onUpdateData }: ConfirmApplyStepProps) {
  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getUpdateTypeLabel = () => {
    switch (data.updateType) {
      case 'percentage_increase': return `${data.updateValue}% increase`;
      case 'percentage_decrease': return `${data.updateValue}% decrease`;
      case 'fixed_increase': return `${formatCurrency(parseFloat(data.updateValue))} increase`;
      case 'fixed_decrease': return `${formatCurrency(parseFloat(data.updateValue))} decrease`;
      case 'set_new': return 'Per-employee custom salaries';
      default: return 'Unknown';
    }
  };

  const isIncrease = totalChange >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Confirm & Apply</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review the summary and confirm to apply the salary changes
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This action will update salaries for {employeeCount} employee(s). 
          This action cannot be easily undone. Please review carefully before proceeding.
        </AlertDescription>
      </Alert>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees Affected</p>
                <p className="text-lg font-semibold">{employeeCount} employees</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Effective Date</p>
                <p className="text-lg font-semibold">
                  {data.effectiveDate ? format(data.effectiveDate, 'MMMM d, yyyy') : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Update Type</p>
                <p className="text-lg font-semibold">{getUpdateTypeLabel()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isIncrease ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                <CheckCircle2 className={`h-5 w-5 ${isIncrease ? 'text-green-600' : 'text-destructive'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impact</p>
                <p className={`text-lg font-semibold ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {isIncrease ? '+' : '-'}{formatCurrency(totalChange)} / month
                </p>
              </div>
            </div>
          </div>

          {/* Components added */}
          {(data.allowances.length > 0 || data.deductions.length > 0) && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Components Added</p>
              <div className="flex flex-wrap gap-2">
                {data.allowances.map((a, i) => (
                  <Badge key={`allowance-${i}`} variant="secondary">
                    + {a.isCustom ? a.customName : 'Allowance'}
                  </Badge>
                ))}
                {data.deductions.map((d, i) => (
                  <Badge key={`deduction-${i}`} variant="outline">
                    - {d.isCustom ? d.customName : 'Deduction'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* GOSI changes */}
          {data.gosiHandling !== 'keep' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">GOSI Changes</p>
              <Badge variant="outline">
                Individual GOSI salary updates
              </Badge>
            </div>
          )}

          {/* Reason */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Reason</p>
            <p className="font-medium">{data.reason}</p>
            {data.notes && (
              <p className="text-sm text-muted-foreground mt-2">{data.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation checkbox */}
      <Card className={data.confirmed ? 'ring-2 ring-primary border-primary' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm"
              checked={data.confirmed}
              onCheckedChange={(checked) => onUpdateData('confirmed', checked === true)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="confirm" className="font-medium cursor-pointer">
                I confirm these changes are correct
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                By checking this box, I acknowledge that I have reviewed all the salary changes
                and they are accurate. I understand that this action will update employee records
                and create audit logs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!data.confirmed && (
        <p className="text-sm text-muted-foreground">
          Please check the confirmation box to apply the changes
        </p>
      )}
    </div>
  );
}
