import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Users, History } from "lucide-react";
import {
  LeaveTypePoliciesTab,
  EmployeeBalancesTab,
  AdjustmentHistoryTab,
} from "@/components/timemanagement";

export default function TimeManagement() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Time Management</h1>
            <p className="text-muted-foreground">
              Configure leave policies, manage employee balances, and track adjustments.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="policies" className="space-y-6">
            <TabsList className="bg-transparent border-b rounded-none p-0 h-auto w-full justify-start gap-6">
              <TabsTrigger
                value="policies"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
              >
                <FileText className="w-4 h-4 mr-2" />
                Leave Policies
              </TabsTrigger>
              <TabsTrigger
                value="balances"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
              >
                <Users className="w-4 h-4 mr-2" />
                Employee Balances
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-0 text-muted-foreground data-[state=active]:text-primary"
              >
                <History className="w-4 h-4 mr-2" />
                Adjustment History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="policies" className="mt-6">
              <LeaveTypePoliciesTab />
            </TabsContent>

            <TabsContent value="balances" className="mt-6">
              <EmployeeBalancesTab />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <AdjustmentHistoryTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
