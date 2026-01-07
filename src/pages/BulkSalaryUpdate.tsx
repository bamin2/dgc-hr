import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { BulkSalaryUpdateWizard } from "@/components/team/wizard/bulk-salary/BulkSalaryUpdateWizard";

export default function BulkSalaryUpdate() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/payroll")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Bulk Salary Update
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Update salaries for multiple team members at once
              </p>
            </div>
          </div>

          {/* Wizard */}
          <BulkSalaryUpdateWizard />
        </main>
      </div>
    </div>
  );
}
