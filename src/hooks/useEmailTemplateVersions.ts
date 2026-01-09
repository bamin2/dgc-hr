import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  subject: string;
  body_content: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  change_summary: string | null;
}

export function useEmailTemplateVersions(templateId: string) {
  return useQuery({
    queryKey: ["email-template-versions", templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return data as EmailTemplateVersion[];
    },
    enabled: !!templateId,
  });
}
