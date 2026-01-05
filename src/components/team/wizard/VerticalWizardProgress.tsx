import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface VerticalWizardProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function VerticalWizardProgress({
  steps,
  currentStep,
  className,
}: VerticalWizardProgressProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-3">
            {/* Step indicator and line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[40px]",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className="pb-8">
              <p
                className={cn(
                  "font-medium text-sm leading-8",
                  isCurrent || isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
