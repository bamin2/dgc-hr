import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryPresets } from "@/lib/queryOptions";
import type { 
  PayslipTemplate, 
  PayslipTemplateInsert, 
  PayslipTemplateUpdate,
} from "@/types/payslip-template";
import type { Json } from "@/integrations/supabase/types";

// Extend query keys
const payslipTemplateKeys = {
  all: ['payslip-templates'] as const,
  detail: (id: string) => ['payslip-templates', id] as const,
  active: ['payslip-templates', 'active'] as const,
  default: ['payslip-templates', 'default'] as const,
  byLocation: (locationId: string | null) => ['payslip-templates', 'location', locationId] as const,
};

export function usePayslipTemplates() {
  return useQuery({
    queryKey: payslipTemplateKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payslip_templates")
        .select(`
          *,
          work_location:work_locations(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as PayslipTemplate[];
    },
    ...queryPresets.userData,
  });
}

export function usePayslipTemplate(id: string | undefined) {
  return useQuery({
    queryKey: payslipTemplateKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("payslip_templates")
        .select(`
          *,
          work_location:work_locations(id, name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as PayslipTemplate;
    },
    enabled: !!id,
    ...queryPresets.userData,
  });
}

export function useActivePayslipTemplates() {
  return useQuery({
    queryKey: payslipTemplateKeys.active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payslip_templates")
        .select(`
          *,
          work_location:work_locations(id, name)
        `)
        .eq("status", "active")
        .order("is_default", { ascending: false })
        .order("name");

      if (error) throw error;
      return data as unknown as PayslipTemplate[];
    },
    ...queryPresets.userData,
  });
}

export function useDefaultPayslipTemplate(workLocationId?: string | null) {
  return useQuery({
    queryKey: payslipTemplateKeys.byLocation(workLocationId ?? null),
    queryFn: async () => {
      // First try to find a default template for the specific location
      if (workLocationId) {
        const { data: locationTemplate } = await supabase
          .from("payslip_templates")
          .select(`*`)
          .eq("status", "active")
          .eq("is_default", true)
          .eq("work_location_id", workLocationId)
          .single();
        
        if (locationTemplate) return locationTemplate as unknown as PayslipTemplate;
      }

      // Fall back to global default (null work_location_id)
      const { data: globalTemplate, error } = await supabase
        .from("payslip_templates")
        .select(`*`)
        .eq("status", "active")
        .eq("is_default", true)
        .is("work_location_id", null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return globalTemplate as unknown as PayslipTemplate | null;
    },
    ...queryPresets.userData,
  });
}

export function useCreatePayslipTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: PayslipTemplateInsert) => {
      const insertData = {
        name: template.name,
        description: template.description || null,
        status: template.status || 'draft',
        version_number: template.version_number || 1,
        effective_from: template.effective_from || null,
        is_default: template.is_default || false,
        work_location_id: template.work_location_id || null,
        docx_storage_path: template.docx_storage_path,
        original_filename: template.original_filename || null,
        settings: template.settings || {},
      };
      
      const { data, error } = await supabase
        .from("payslip_templates")
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as PayslipTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.all });
      toast.success("Payslip template created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

export function useUpdatePayslipTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PayslipTemplateUpdate }) => {
      const { data, error } = await supabase
        .from("payslip_templates")
        .update(updates as unknown as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PayslipTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.all });
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.detail(data.id) });
      toast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

export function useDuplicatePayslipTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // Get original template
      const { data: original, error: fetchError } = await supabase
        .from("payslip_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const { data, error } = await supabase
        .from("payslip_templates")
        .insert({
          name: `${original.name} (Copy)`,
          description: original.description,
          status: 'draft' as const,
          version_number: 1,
          effective_from: null,
          is_default: false,
          work_location_id: original.work_location_id,
          docx_storage_path: original.docx_storage_path,
          original_filename: original.original_filename,
          settings: original.settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PayslipTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.all });
      toast.success("Template duplicated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate template: ${error.message}`);
    },
  });
}

export function useSetDefaultPayslipTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, workLocationId }: { id: string; workLocationId: string | null }) => {
      // Clear existing defaults for this location scope
      if (workLocationId) {
        await supabase
          .from("payslip_templates")
          .update({ is_default: false })
          .eq("work_location_id", workLocationId);
      } else {
        await supabase
          .from("payslip_templates")
          .update({ is_default: false })
          .is("work_location_id", null);
      }

      // Set new default
      const { data, error } = await supabase
        .from("payslip_templates")
        .update({ is_default: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PayslipTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.all });
      toast.success("Default template updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to set default: ${error.message}`);
    },
  });
}

export function useArchivePayslipTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("payslip_templates")
        .update({ status: 'archived' as const, is_default: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PayslipTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.all });
      toast.success("Template archived");
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive template: ${error.message}`);
    },
  });
}

export function useDeletePayslipTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payslip_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payslipTemplateKeys.all });
      toast.success("Template deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

// Export query keys for external use
export { payslipTemplateKeys };
