import {
  Sidebar,
  Header,
  ImpersonationBanner,
} from "@/components/dashboard";
import { DashboardRenderer } from "@/components/dashboard/DashboardRenderer";

const Index = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ImpersonationBanner />
        <Header />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <DashboardRenderer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
