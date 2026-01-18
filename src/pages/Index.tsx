import { DashboardLayout } from "@/components/dashboard";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";
import { useRole } from "@/contexts/RoleContext";
import { useTimeToFirstData } from "@/lib/perf";

const Index = () => {
  const { isLoading } = useRole();
  
  // Track time to first data for Dashboard
  useTimeToFirstData('Dashboard', isLoading);
  
  return (
    <DashboardLayout>
      <DashboardRenderer />
    </DashboardLayout>
  );
};

export default Index;
