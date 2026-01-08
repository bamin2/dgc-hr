import { Sidebar, Header } from "@/components/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare } from "lucide-react";
import { useState } from "react";
import { 
  PendingApprovalsTab, 
  MyRequestsTab, 
  TeamRequestsTab 
} from "@/components/approvals";
import { useRole } from "@/contexts/RoleContext";

const ApprovalsPage = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const { hasRole } = useRole();
  const isManager = hasRole("manager") || hasRole("hr") || hasRole("admin");

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10">
                <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Approvals & Requests
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage and track approval requests
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                {isManager && (
                  <TabsTrigger value="team-requests">Team Requests</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="approvals" className="mt-6">
                <PendingApprovalsTab />
              </TabsContent>

              <TabsContent value="my-requests" className="mt-6">
                <MyRequestsTab />
              </TabsContent>

              {isManager && (
                <TabsContent value="team-requests" className="mt-6">
                  <TeamRequestsTab />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApprovalsPage;
