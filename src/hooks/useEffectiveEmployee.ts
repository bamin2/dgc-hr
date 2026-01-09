import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Helper hook that returns the effective employee ID for data fetching.
 * When impersonating, returns the impersonated employee's ID.
 * Otherwise, returns the actual logged-in user's employee ID.
 */
export function useEffectiveEmployee() {
  const { profile } = useAuth();
  const { 
    isImpersonating, 
    impersonatedEmployee, 
    effectiveEmployeeId,
    effectiveTeamMemberIds,
  } = useRole();

  return {
    /** The employee ID to use for data fetching (impersonated or actual) */
    effectiveEmployeeId,
    /** Whether we are currently impersonating another employee */
    isImpersonating,
    /** The impersonated employee details (null if not impersonating) */
    impersonatedEmployee,
    /** The actual logged-in user's employee ID */
    actualEmployeeId: profile?.employee_id ?? null,
    /** Team member IDs for the effective employee (impersonated or actual) */
    effectiveTeamMemberIds,
  };
}
