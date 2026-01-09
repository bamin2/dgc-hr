import { DashboardLayout } from "@/components/dashboard";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <DashboardRenderer />
      </div>
    </DashboardLayout>
  );
};

export default Index;
