import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { queryKeys } from "@/lib/queryKeys";

// Type for per-nationality GOSI rates
export interface GosiNationalityRate {
  nationality: string;
  employeeRate: number;    // Deducted from employee's salary
  employerRate: number;    // Employer contribution (display only)
}

export type GosiBaseCalculation = 'gosi_registered_salary' | 'basic_plus_housing';

export interface WorkLocation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  is_remote: boolean;
  is_hq: boolean;
  created_at: string;
  employeeCount: number;
  gosi_enabled: boolean;
  gosi_nationality_rates: GosiNationalityRate[];
  gosi_base_calculation: GosiBaseCalculation;
}

export interface WorkLocationInput {
  name: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  currency?: string;
  is_remote?: boolean;
  is_hq?: boolean;
  gosi_enabled?: boolean;
  gosi_nationality_rates?: GosiNationalityRate[];
  gosi_base_calculation?: GosiBaseCalculation;
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
    is_hq: loc.is_hq ?? false,
    created_at: loc.created_at,
    employeeCount: countMap.get(loc.id) || 0,
    gosi_enabled: loc.gosi_enabled ?? false,
    gosi_nationality_rates: (loc.gosi_nationality_rates as unknown as GosiNationalityRate[]) || [],
    gosi_base_calculation: (loc.gosi_base_calculation as GosiBaseCalculation) || 'gosi_registered_salary',
  }));
}

export function useWorkLocations() {
  return useQuery({
    queryKey: queryKeys.company.workLocations,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.company.workLocations });
    },
  });
}

export function useUpdateWorkLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: WorkLocationInput & { id: string }) => {
      // If setting as HQ, first unmark any existing HQ
      if (input.is_hq) {
        await supabase
          .from("work_locations")
          .update({ is_hq: false })
          .eq("is_hq", true)
          .neq("id", id);
      }

      const { data, error } = await supabase
        .from("work_locations")
        .update({
          name: input.name,
          address: input.address,
          city: input.city,
          country: input.country,
          currency: input.currency,
          is_remote: input.is_remote,
          is_hq: input.is_hq,
          gosi_enabled: input.gosi_enabled,
          gosi_nationality_rates: JSON.parse(JSON.stringify(input.gosi_nationality_rates || [])),
          gosi_base_calculation: input.gosi_base_calculation,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.company.workLocations });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.company.workLocations });
    },
  });
}
