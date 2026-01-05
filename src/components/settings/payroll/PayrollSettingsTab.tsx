import { AllowanceTemplatesSection } from "./AllowanceTemplatesSection";
import { DeductionTemplatesSection } from "./DeductionTemplatesSection";

export function PayrollSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payroll Templates</h3>
        <p className="text-sm text-muted-foreground">
          Manage allowance and deduction templates that can be assigned to employees during onboarding.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AllowanceTemplatesSection />
        <DeductionTemplatesSection />
      </div>
    </div>
  );
}
