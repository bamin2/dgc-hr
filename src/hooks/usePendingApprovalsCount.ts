import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { measureAsync } from "@/lib/perf";

export function usePendingApprovalsCount() {
  const { currentUser } = useRole();

  return useQuery({
    queryKey: ["pending-approvals-count", currentUser?.id],
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    queryFn: () => measureAsync("PendingApprovalsCount", async () => {
      if (!currentUser?.id) return 0;

      const { count, error } = await supabase
        .from("request_approval_steps")
        .select("*", { count: "exact", head: true })
        .eq("approver_user_id", currentUser.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending approvals count:", error);
        return 0;
      }
      return count || 0;
    }),
    enabled: !!currentUser?.id,
  });
}
