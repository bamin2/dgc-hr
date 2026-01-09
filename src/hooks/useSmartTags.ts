import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

export interface SmartTag {
  id: string;
  tag: string;
  field: string;
  source: string;
  category: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SmartTagInsert = Omit<SmartTag, "id" | "created_at" | "updated_at">;
export type SmartTagUpdate = Partial<SmartTagInsert>;

export function useSmartTags() {
  return useQuery({
    queryKey: queryKeys.smartTags.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("smart_tags")
        .select("*")
        .order("category")
        .order("tag");

      if (error) throw error;
      return data as SmartTag[];
    },
  });
}

export function useActiveSmartTags() {
  return useQuery({
    queryKey: queryKeys.smartTags.active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("smart_tags")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("tag");

      if (error) throw error;
      return data as SmartTag[];
    },
  });
}

export function useSmartTagCategories() {
  const { data: smartTags } = useSmartTags();
  const categories = [...new Set(smartTags?.map((t) => t.category) || [])];
  return categories;
}

export function useCreateSmartTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTag: SmartTagInsert) => {
      const { data, error } = await supabase
        .from("smart_tags")
        .insert(newTag)
        .select()
        .single();

      if (error) throw error;
      return data as SmartTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smartTags.all });
      toast.success("Smart tag created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create smart tag: ${error.message}`);
    },
  });
}

export function useUpdateSmartTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SmartTagUpdate }) => {
      const { data, error } = await supabase
        .from("smart_tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SmartTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smartTags.all });
      toast.success("Smart tag updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update smart tag: ${error.message}`);
    },
  });
}

export function useDeleteSmartTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("smart_tags")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smartTags.all });
      toast.success("Smart tag deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete smart tag: ${error.message}`);
    },
  });
}
