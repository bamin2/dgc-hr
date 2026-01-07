import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BulkSalaryWizardData, CHANGE_TYPE_OPTIONS } from "../types";
import { SalaryChangeType } from "@/hooks/useSalaryHistory";

interface ReasonNotesStepProps {
  data: BulkSalaryWizardData;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

export function ReasonNotesStep({ data, onUpdateData }: ReasonNotesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Reason & Notes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Document the reason for this salary update for audit purposes
        </p>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="change-type">Change Type *</Label>
          <Select
            value={data.changeType}
            onValueChange={(value) => onUpdateData('changeType', value as SalaryChangeType)}
          >
            <SelectTrigger id="change-type">
              <SelectValue placeholder="Select change type" />
            </SelectTrigger>
            <SelectContent>
              {CHANGE_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This helps categorize the salary update for reporting
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason *</Label>
          <Input
            id="reason"
            placeholder="e.g., Annual performance review adjustment"
            value={data.reason}
            onChange={(e) => onUpdateData('reason', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Provide a brief reason for this salary change
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes for internal reference..."
            value={data.notes}
            onChange={(e) => onUpdateData('notes', e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            These notes will be stored with the batch record for future reference
          </p>
        </div>
      </div>

      {!data.reason && (
        <p className="text-sm text-destructive">
          Please provide a reason to continue
        </p>
      )}
    </div>
  );
}
