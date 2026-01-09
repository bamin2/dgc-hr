import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { OnboardingWizard } from "@/components/employees/wizard";

export default function NewOnboarding() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              New Employee Onboarding
            </h1>
            <p className="text-muted-foreground">
              Set up a new hire with a pre-built workflow template
            </p>
          </div>
        </div>

        {/* Wizard */}
        <OnboardingWizard />
      </div>
    </DashboardLayout>
  );
}
