import { Label } from "@/components/ui/label";
import { HierarchicalCalendar } from "@/components/ui/hierarchical-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Info, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { BulkSalaryWizardData } from "../types";

interface EffectiveDateStepProps {
  data: BulkSalaryWizardData;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

export function EffectiveDateStep({ data, onUpdateData }: EffectiveDateStepProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBackdated = data.effectiveDate && data.effectiveDate < today;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Effective Date</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select when these salary changes should take effect
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You may select a past, current, or future date. Backdated changes will be recorded
          but may require retroactive payroll adjustments.
        </AlertDescription>
      </Alert>

      {isBackdated && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-600 dark:text-amber-400">
            You have selected a past date. This change will be backdated and may require
            manual retroactive payroll corrections for affected pay periods.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-4">
            <HierarchicalCalendar
              selected={data.effectiveDate || undefined}
              onSelect={(date) => onUpdateData('effectiveDate', date || null)}
            />
          </CardContent>
        </Card>

        <Card className="md:w-72">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Date</p>
                <p className="font-semibold">
                  {data.effectiveDate
                    ? format(data.effectiveDate, 'MMMM d, yyyy')
                    : 'Not selected'}
                </p>
              </div>
            </div>

            {data.effectiveDate && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Day of Week</p>
                  <p className="font-medium">{format(data.effectiveDate, 'EEEE')}</p>
                </div>

                {data.effectiveDate.getTime() === today.getTime() && (
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-sm text-primary font-medium">
                      Changes will be applied immediately
                    </p>
                  </div>
                )}

                {data.effectiveDate > today && (
                  <div className="bg-amber-500/10 rounded-lg p-3">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      Changes will be applied on the selected date
                    </p>
                  </div>
                )}

                {isBackdated && (
                  <div className="bg-amber-500/10 rounded-lg p-3">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      Backdated — retroactive payroll adjustment may be needed
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {!data.effectiveDate && (
        <p className="text-sm text-destructive">
          Please select an effective date to continue
        </p>
      )}
    </div>
  );
}
