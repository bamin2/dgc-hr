import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MyHRLetter {
  id: string;
  pdf_storage_path: string;
  created_at: string;
  processed_at: string | null;
  template: {
    id: string;
    name: string;
    category: string;
  } | null;
}

export function useMyHRLetters(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['my-hr-letters', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_document_requests')
        .select(`
          id, 
          pdf_storage_path, 
          created_at, 
          processed_at,
          template:document_templates(id, name, category)
        `)
        .eq('employee_id', employeeId!)
        .eq('status', 'approved')
        .not('pdf_storage_path', 'is', null)
        .order('processed_at', { ascending: false });
      
      if (error) throw error;
      return data as MyHRLetter[];
    },
    enabled: !!employeeId,
  });
}
