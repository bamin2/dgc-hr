import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { OnboardingWizard } from "@/components/employees/wizard";

export default function NewOnboarding() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/employees")}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <PageHeader
          title="New Employee Onboarding"
          subtitle="Set up a new hire with a pre-built workflow template"
        />

        {/* Wizard */}
        <OnboardingWizard />
      </div>
    </DashboardLayout>
  );
}
