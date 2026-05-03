import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { AppRole } from "@/data/roles";
import { PageLoader } from "@/components/ui/page-loader";
import { OnboardingGate } from "./OnboardingGate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { currentUser } = useRole();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return <PageLoader />;
  }

  // Redirect to auth page if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Block all protected routes when the signed-in user has no linked employee.
  // Only gate once profile has resolved to avoid flashing for everyone on first paint.
  if (profile && profile.employee_id === null) {
    return <OnboardingGate />;
  }

  // Check role requirements if specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(currentUser.role)) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

// Public route that redirects to home if already logged in
interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  // Redirect to home if already logged in
  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
