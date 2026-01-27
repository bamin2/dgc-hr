import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { MobileActionBar } from "./MobileActionBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Use full width without max-width constraint (e.g., org chart) */
  fullWidth?: boolean;
  /** Remove default content padding */
  noPadding?: boolean;
}

export function DashboardLayout({ 
  children, 
  fullWidth = false,
  noPadding = false 
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ImpersonationBanner />
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div 
            className={cn(
              "w-full min-h-full",
              !noPadding && "px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6",
              !fullWidth && "max-w-[1600px] mx-auto",
              // Add bottom padding on mobile for the navigation bar
              isMobile && "pb-24"
            )}
          >
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <MobileActionBar />
    </div>
  );
}
