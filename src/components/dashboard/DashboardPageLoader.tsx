import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { Loader2 } from "lucide-react";

export function DashboardPageLoader() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ImpersonationBanner />
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    </div>
  );
}
