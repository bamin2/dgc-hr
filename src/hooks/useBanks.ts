import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Bank {
  id: string;
  name: string;
  swift_code: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankInput {
  name: string;
  swift_code?: string | null;
  country?: string | null;
  is_active?: boolean;
}

export const useBanks = () => {
  return useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banks")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Bank[];
    },
  });
};

export const useCreateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bank: BankInput) => {
      const { data, error } = await supabase
        .from("banks")
        .insert(bank)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add bank: ${error.message}`);
    },
  });
};

export const useUpdateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...bank }: BankInput & { id: string }) => {
      const { data, error } = await supabase
        .from("banks")
        .update(bank)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update bank: ${error.message}`);
    },
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if any employees are using this bank
      const { data: banks } = await supabase
        .from("banks")
        .select("name")
        .eq("id", id)
        .single();

      if (banks) {
        const { data: employees } = await supabase
          .from("employees")
          .select("id")
          .eq("bank_name", banks.name)
          .limit(1);

        if (employees && employees.length > 0) {
          throw new Error("Cannot delete bank that is assigned to employees");
        }
      }

      const { error } = await supabase.from("banks").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      toast.success("Bank deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
