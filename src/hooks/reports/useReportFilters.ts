import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LocationOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function fetchWorkLocations(): Promise<LocationOption[]> {
  const { data, error } = await db.from('work_locations').select('id, name').eq('is_active', true);
  if (error) throw error;
  return (data ?? []) as LocationOption[];
}

async function fetchDepartments(): Promise<DepartmentOption[]> {
  const { data, error } = await db.from('departments').select('id, name');
  if (error) throw error;
  return (data ?? []) as DepartmentOption[];
}

export function useWorkLocationsFilter(queryKeySuffix: string = '') {
  return useQuery({
    queryKey: ['work-locations-filter', queryKeySuffix],
    queryFn: fetchWorkLocations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentsFilter(queryKeySuffix: string = '') {
  return useQuery({
    queryKey: ['departments-filter', queryKeySuffix],
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000,
  });
}
