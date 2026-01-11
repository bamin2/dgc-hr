import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HiringTabs } from "@/components/hiring/HiringTabs";

export default function Hiring() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring</h1>
          <p className="text-muted-foreground">
            Manage candidates, offers, and the hiring pipeline
          </p>
        </div>
        <HiringTabs />
      </div>
    </DashboardLayout>
  );
}
