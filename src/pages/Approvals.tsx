import { DashboardLayout } from "@/components/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  PendingApprovalsTab, 
  MyRequestsTab, 
  TeamRequestsTab,
  AllPendingApprovalsTab 
} from "@/components/approvals";
import { useRole } from "@/contexts/RoleContext";

const ApprovalsPage = () => {
  const [searchParams] = useSearchParams();
  const { hasRole } = useRole();
  const isManager = hasRole("manager") || hasRole("hr") || hasRole("admin");
  const isHrOrAdmin = hasRole("hr") || hasRole("admin");

  // Read initial tab from URL params
  const tabParam = searchParams.get("tab");
  
  const getInitialTab = () => {
    if (tabParam === "all-requests" && isHrOrAdmin) {
      return "all-requests";
    }
    if (tabParam === "approvals") {
      return "approvals";
    }
    return "my-requests";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update active tab when URL params change
  useEffect(() => {
    if (tabParam === "all-requests" && isHrOrAdmin) {
      setActiveTab("all-requests");
    } else if (tabParam === "approvals") {
      setActiveTab("approvals");
    }
  }, [tabParam, isHrOrAdmin]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10">
            <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Requests & Approvals
            </h1>
            <p className="text-sm text-muted-foreground">
              Submit and track your requests
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            {isManager && (
              <TabsTrigger value="team-requests">Team Requests</TabsTrigger>
            )}
            {isHrOrAdmin && (
              <TabsTrigger value="all-requests">All Requests</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="my-requests" className="mt-6">
            <MyRequestsTab />
          </TabsContent>

          <TabsContent value="approvals" className="mt-6">
            <PendingApprovalsTab />
          </TabsContent>

          {isManager && (
            <TabsContent value="team-requests" className="mt-6">
              <TeamRequestsTab />
            </TabsContent>
          )}

          {isHrOrAdmin && (
            <TabsContent value="all-requests" className="mt-6">
              <AllPendingApprovalsTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ApprovalsPage;
