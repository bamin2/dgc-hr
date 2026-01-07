import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BulkSalaryWizardData, UpdateType } from "../types";

interface UpdateTypeStepProps {
  data: BulkSalaryWizardData;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

const updateOptions: { value: UpdateType; label: string; description: string; icon: typeof TrendingUp }[] = [
  {
    value: 'percentage_increase',
    label: 'Percentage Increase',
    description: 'Increase salaries by a percentage',
    icon: TrendingUp,
  },
  {
    value: 'percentage_decrease',
    label: 'Percentage Decrease',
    description: 'Decrease salaries by a percentage',
    icon: TrendingDown,
  },
  {
    value: 'fixed_increase',
    label: 'Fixed Amount Increase',
    description: 'Add a fixed amount to salaries',
    icon: TrendingUp,
  },
  {
    value: 'fixed_decrease',
    label: 'Fixed Amount Decrease',
    description: 'Subtract a fixed amount from salaries',
    icon: TrendingDown,
  },
  {
    value: 'set_new',
    label: 'Set New Basic Salary',
    description: 'Set a specific salary amount for all selected employees',
    icon: DollarSign,
  },
];

export function UpdateTypeStep({ data, onUpdateData }: UpdateTypeStepProps) {
  const isPercentage = data.updateType?.includes('percentage');
  const isSetNew = data.updateType === 'set_new';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Choose Update Type</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select how you want to change the salaries for the selected employees
        </p>
      </div>

      <RadioGroup
        value={data.updateType || ''}
        onValueChange={(value) => {
          onUpdateData('updateType', value as UpdateType);
          onUpdateData('updateValue', '');
        }}
        className="space-y-3"
      >
        {updateOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = data.updateType === option.value;
          const isDecrease = option.value.includes('decrease');
          
          return (
            <div key={option.value}>
              <Card
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  onUpdateData('updateType', option.value);
                  onUpdateData('updateValue', '');
                }}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div
                    className={`p-2 rounded-lg ${
                      isDecrease
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </RadioGroup>

      {data.updateType && (
        <div className="space-y-2 pt-4">
          <Label htmlFor="update-value">
            {isSetNew
              ? 'New Salary Amount'
              : isPercentage
              ? 'Percentage Value'
              : 'Amount'}
          </Label>
          <div className="relative max-w-xs">
            {!isPercentage && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
            )}
            <Input
              id="update-value"
              type="number"
              placeholder={isPercentage ? "e.g., 5" : "e.g., 500"}
              value={data.updateValue}
              onChange={(e) => onUpdateData('updateValue', e.target.value)}
              className={!isPercentage ? 'pl-8' : ''}
              min="0"
              step={isPercentage ? "0.1" : "1"}
            />
            {isPercentage && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            )}
          </div>
          {isPercentage && (
            <p className="text-xs text-muted-foreground">
              Enter a value between 0 and 100
            </p>
          )}
        </div>
      )}

      {!data.updateType && (
        <p className="text-sm text-destructive">
          Please select an update type to continue
        </p>
      )}
    </div>
  );
}
