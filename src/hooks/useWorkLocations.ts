import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  is_remote: boolean;
  created_at: string;
  employeeCount: number;
  gosi_enabled: boolean;
  gosi_percentage: number;
}

export interface WorkLocationInput {
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  currency?: string;
  is_remote?: boolean;
  gosi_enabled?: boolean;
  gosi_percentage?: number;
}

async function fetchWorkLocationsWithCounts(): Promise<WorkLocation[]> {
  const { data: locations, error } = await supabase
    .from("work_locations")
    .select("*")
    .order("name");

  if (error) throw error;

  // Get employee counts for each location
  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select("work_location_id");

  if (empError) throw empError;

  const countMap = new Map<string, number>();
  employees?.forEach((emp) => {
    if (emp.work_location_id) {
      countMap.set(emp.work_location_id, (countMap.get(emp.work_location_id) || 0) + 1);
    }
  });

  return (locations || []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    address: loc.address,
    city: loc.city,
    country: loc.country,
    currency: loc.currency || "USD",
    is_remote: loc.is_remote ?? false,
    created_at: loc.created_at,
    employeeCount: countMap.get(loc.id) || 0,
    gosi_enabled: loc.gosi_enabled ?? false,
    gosi_percentage: loc.gosi_percentage ?? 8,
  }));
}

export function useWorkLocations() {
  return useQuery({
    queryKey: ["work-locations"],
    queryFn: fetchWorkLocationsWithCounts,
  });
}

export function useCreateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WorkLocationInput) => {
      const { data, error } = await supabase
        .from("work_locations")
        .insert({
          name: input.name,
          address: input.address || null,
          city: input.city || null,
          country: input.country || null,
          currency: input.currency || "USD",
          is_remote: input.is_remote ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-locations"] });
    },
  });
}

export function useUpdateWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: WorkLocationInput & { id: string }) => {
      const { data, error } = await supabase
        .from("work_locations")
        .update({
          name: input.name,
          address: input.address,
          city: input.city,
          country: input.country,
          currency: input.currency,
          is_remote: input.is_remote,
          gosi_enabled: input.gosi_enabled,
          gosi_percentage: input.gosi_percentage,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-locations"] });
    },
  });
}

export function useDeleteWorkLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if any employees are assigned to this location
      const { data: employees, error: checkError } = await supabase
        .from("employees")
        .select("id")
        .eq("work_location_id", id)
        .limit(1);

      if (checkError) throw checkError;

      if (employees && employees.length > 0) {
        throw new Error("Cannot delete work location with assigned employees");
      }

      const { error } = await supabase
        .from("work_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-locations"] });
    },
  });
}
