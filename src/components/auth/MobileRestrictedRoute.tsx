import { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DesktopRequiredMessage } from "@/components/ui/DesktopRequiredMessage";

interface MobileRestrictedRouteProps {
  children: ReactNode;
  featureName?: string;
}

/**
 * Wrapper component that restricts access to certain features on mobile devices.
 * Shows a "Desktop Required" message when accessed on screens smaller than 1024px.
 */
export function MobileRestrictedRoute({ children, featureName }: MobileRestrictedRouteProps) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  if (isMobile) {
    return (
      <DashboardLayout>
        <DesktopRequiredMessage featureName={featureName} />
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
