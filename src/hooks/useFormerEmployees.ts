import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type DepartureReason = Database["public"]["Enums"]["departure_reason"];

export interface FormerEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  position?: string;
  joinDate: string;
  status: "resigned" | "terminated";
  lastWorkingDay?: string;
  departureReason?: DepartureReason;
  exitInterviewCompleted?: boolean;
  exitInterviewNotes?: string;
  offboardingRecordId?: string;
}

async function fetchFormerEmployees(): Promise<FormerEmployee[]> {
  // Fetch employees with resigned or terminated status
  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      avatar_url,
      join_date,
      status,
      department:departments(name),
      position:positions(title)
    `)
    .in("status", ["resigned", "terminated"]);

  if (empError) throw empError;
  if (!employees || employees.length === 0) return [];

  // Get employee IDs for offboarding lookup
  const employeeIds = employees.map((e) => e.id);

  // Fetch offboarding records for these employees
  const { data: offboardingRecords, error: offError } = await supabase
    .from("offboarding_records")
    .select(`
      id,
      employee_id,
      last_working_day,
      departure_reason
    `)
    .in("employee_id", employeeIds);

  if (offError) throw offError;

  // Get offboarding record IDs for exit interview lookup
  const offboardingIds = offboardingRecords?.map((o) => o.id) || [];

  // Fetch exit interviews
  let exitInterviews: { offboarding_record_id: string; completed: boolean | null; notes: string | null }[] = [];
  if (offboardingIds.length > 0) {
    const { data: interviews, error: intError } = await supabase
      .from("exit_interviews")
      .select(`
        offboarding_record_id,
        completed,
        notes
      `)
      .in("offboarding_record_id", offboardingIds);

    if (intError) throw intError;
    exitInterviews = interviews || [];
  }

  // Create lookup maps
  const offboardingMap = new Map(
    offboardingRecords?.map((o) => [o.employee_id, o]) || []
  );
  const exitInterviewMap = new Map(
    exitInterviews.map((i) => [i.offboarding_record_id, i])
  );

  // Map and combine data
  return employees.map((emp) => {
    const offboarding = offboardingMap.get(emp.id);
    const exitInterview = offboarding
      ? exitInterviewMap.get(offboarding.id)
      : undefined;

    return {
      id: emp.id,
      firstName: emp.first_name,
      lastName: emp.last_name,
      email: emp.email,
      phone: emp.phone || undefined,
      avatar: emp.avatar_url || undefined,
      department: (emp.department as { name: string } | null)?.name,
      position: (emp.position as { title: string } | null)?.title,
      joinDate: emp.join_date || new Date().toISOString(),
      status: emp.status as "resigned" | "terminated",
      lastWorkingDay: offboarding?.last_working_day,
      departureReason: offboarding?.departure_reason,
      exitInterviewCompleted: exitInterview?.completed ?? undefined,
      exitInterviewNotes: exitInterview?.notes ?? undefined,
      offboardingRecordId: offboarding?.id,
    };
  });
}

export function useFormerEmployees() {
  return useQuery({
    queryKey: ["former-employees"],
    queryFn: fetchFormerEmployees,
  });
}
