import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <div className="space-y-6">
        <PageHeader
          title="Requests & Approvals"
          subtitle="Submit and track your requests"
        />

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
