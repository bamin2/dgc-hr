import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { HiringTabs } from "@/components/hiring/HiringTabs";

export default function Hiring() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Hiring"
        subtitle="Manage candidates, offers, and the hiring pipeline"
      />
      <HiringTabs />
    </DashboardLayout>
  );
}
