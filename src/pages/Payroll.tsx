import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayrollDashboard } from "@/components/payroll/PayrollDashboard";
import { PayrollRunsTab } from "@/components/payroll/PayrollRunsTab";

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [autoStartWizard, setAutoStartWizard] = useState(false);

  const handleRunPayroll = () => {
    setAutoStartWizard(true);
    setActiveTab("runs");
  };

  const handleWizardStarted = () => {
    setAutoStartWizard(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage employee salaries and process payroll
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="runs">Payroll Runs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <PayrollDashboard onRunPayroll={handleRunPayroll} />
          </TabsContent>

          <TabsContent value="runs" className="mt-6">
            <PayrollRunsTab
              autoStartWizard={autoStartWizard}
              onWizardStarted={handleWizardStarted}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
