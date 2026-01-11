import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConversionInput {
  candidateId: string;
  offerId: string;
  versionId: string;
}

export function useConvertToEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, offerId, versionId }: ConversionInput) => {
      // Get candidate data
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (candidateError) throw candidateError;

      // Get accepted version data with related data
      const { data: version, error: versionError } = await supabase
        .from("offer_versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      // Create employee from candidate and offer version data
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .insert({
          first_name: candidate.first_name,
          last_name: candidate.last_name,
          email: candidate.email,
          phone: candidate.phone,
          nationality: candidate.nationality,
          department_id: version.department_id,
          position_id: version.position_id,
          work_location_id: version.work_location_id,
          manager_id: version.manager_employee_id,
          join_date: version.start_date,
          salary: version.basic_salary,
          salary_currency_code: version.currency_code,
          status: 'active',
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Create employee allowances for housing, transport, and other
      const allowancesToCreate = [];
      
      if (version.housing_allowance > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Housing Allowance',
          custom_amount: version.housing_allowance,
          effective_date: version.start_date,
        });
      }
      
      if (version.transport_allowance > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Transport Allowance',
          custom_amount: version.transport_allowance,
          effective_date: version.start_date,
        });
      }
      
      if (version.other_allowances > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Other Allowances',
          custom_amount: version.other_allowances,
          effective_date: version.start_date,
        });
      }

      if (allowancesToCreate.length > 0) {
        const { error: allowanceError } = await supabase
          .from("employee_allowances")
          .insert(allowancesToCreate);

        if (allowanceError) {
          console.error("Failed to create allowances:", allowanceError);
        }
      }

      // Log the conversion
      const { error: logError } = await supabase
        .from("employee_conversion_log")
        .insert({
          candidate_id: candidateId,
          offer_id: offerId,
          offer_version_id: versionId,
          employee_id: employee.id,
        });

      if (logError) {
        console.error("Failed to log conversion:", logError);
      }

      // Archive the candidate
      await supabase
        .from("candidates")
        .update({ status: 'archived' })
        .eq("id", candidateId);

      // Archive the offer
      await supabase
        .from("offers")
        .update({ status: 'archived' })
        .eq("id", offerId);

      return { employeeId: employee.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Candidate converted to employee successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to convert to employee: ${error.message}`);
    },
  });
}
