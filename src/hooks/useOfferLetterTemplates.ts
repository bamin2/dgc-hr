import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OfferLetterTemplate {
  id: string;
  template_name: string;
  description: string | null;
  is_active: boolean;
  subject_template: string;
  body_template: string;
  placeholders_supported: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateFormData {
  template_name: string;
  description?: string;
  is_active?: boolean;
  subject_template: string;
  body_template: string;
}

export function useOfferLetterTemplates(activeOnly: boolean = false) {
  return useQuery({
    queryKey: ["offer-letter-templates", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("offer_letter_templates")
        .select("*")
        .order("template_name");

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as OfferLetterTemplate[];
    },
  });
}

export function useOfferLetterTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["offer-letter-template", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("offer_letter_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as OfferLetterTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateOfferLetterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const { data: result, error } = await supabase
        .from("offer_letter_templates")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-letter-templates"] });
      toast.success("Template created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

export function useUpdateOfferLetterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TemplateFormData> }) => {
      const { data: result, error } = await supabase
        .from("offer_letter_templates")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["offer-letter-templates"] });
      queryClient.invalidateQueries({ queryKey: ["offer-letter-template", id] });
      toast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

export function useDeleteOfferLetterTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("offer_letter_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-letter-templates"] });
      toast.success("Template deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

// Helper function to render template with placeholders
export function renderTemplate(template: string, data: Record<string, string | number>): string {
  let rendered = template;
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    rendered = rendered.replace(regex, String(value));
  });
  
  return rendered;
}

// Get placeholder values from offer version and candidate
export function getPlaceholderValues(
  candidate: { first_name: string; last_name: string },
  version: {
    currency_code: string;
    basic_salary: number;
    housing_allowance: number;
    transport_allowance: number;
    other_allowances: number;
    gross_pay_total: number;
    employer_gosi_amount: number;
    start_date?: string | null;
  },
  context: {
    job_title?: string;
    department?: string;
    work_location?: string;
    company_name?: string;
  }
): Record<string, string | number> {
  return {
    candidate_name: `${candidate.first_name} ${candidate.last_name}`,
    job_title: context.job_title || 'Position',
    department: context.department || 'Department',
    work_location: context.work_location || 'Location',
    start_date: version.start_date || 'TBD',
    currency: version.currency_code,
    basic_salary: version.basic_salary.toLocaleString(),
    housing_allowance: version.housing_allowance.toLocaleString(),
    transport_allowance: version.transport_allowance.toLocaleString(),
    other_allowances: version.other_allowances.toLocaleString(),
    gross_pay_total: version.gross_pay_total.toLocaleString(),
    employer_gosi_amount: version.employer_gosi_amount.toLocaleString(),
    company_name: context.company_name || 'Company',
    current_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  };
}
