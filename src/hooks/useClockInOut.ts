import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";

export function useClockInOut() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch current user's employee_id from profile
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("employee_id")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const employeeId = profile?.employee_id;

  // Fetch today's attendance record
  const {
    data: todayRecord,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["today-attendance", employeeId, today],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Clock in mutation
  const clockIn = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("No employee ID found");
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("attendance_records")
        .upsert(
          {
            employee_id: employeeId,
            date: today,
            check_in: now,
            status: "present",
          },
          { onConflict: "employee_id,date" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Clocked in successfully");
    },
    onError: (error) => {
      toast.error("Failed to clock in: " + error.message);
    },
  });

  // Clock out mutation
  const clockOut = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("No employee ID found");
      if (!todayRecord?.check_in) throw new Error("No check-in record found");

      const now = new Date();
      const checkInTime = new Date(todayRecord.check_in);
      const workHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const { data, error } = await supabase
        .from("attendance_records")
        .update({
          check_out: now.toISOString(),
          work_hours: Math.round(workHours * 100) / 100,
        })
        .eq("employee_id", employeeId)
        .eq("date", today)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Clocked out successfully");
    },
    onError: (error) => {
      toast.error("Failed to clock out: " + error.message);
    },
  });

  const isClockedIn = !!todayRecord?.check_in && !todayRecord?.check_out;
  const isClockedOut = !!todayRecord?.check_in && !!todayRecord?.check_out;

  return {
    todayRecord,
    isLoading,
    isClockedIn,
    isClockedOut,
    clockIn,
    clockOut,
    employeeId,
    refetch,
  };
}
