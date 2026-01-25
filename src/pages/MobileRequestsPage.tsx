import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MobileRequestsHub } from "@/components/requests/MobileRequestsHub";

export default function MobileRequestsPage() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <MobileRequestsHub />
      </div>
    </DashboardLayout>
  );
}
