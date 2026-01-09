import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MyDocument {
  id: string;
  document_name: string;
  document_number: string | null;
  document_type_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string | null;
  document_type?: {
    id: string;
    name: string;
  };
}

export function useMyDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['my-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('employee_documents')
        .select(`
          id,
          document_name,
          document_number,
          document_type_id,
          file_name,
          file_url,
          file_size,
          mime_type,
          issue_date,
          expiry_date,
          notes,
          created_at,
          document_type:document_types(id, name)
        `)
        .eq('employee_id', employeeId)
        .eq('visible_to_employee', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MyDocument[];
    },
    enabled: !!employeeId,
  });
}
