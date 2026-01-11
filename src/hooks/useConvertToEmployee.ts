import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Candidate } from "./useCandidates";
import type { Offer, OfferVersion } from "./useOffers";

interface ConversionData {
  candidate: Candidate;
  offer: Offer;
  acceptedVersion: OfferVersion;
}

export function useConvertToEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidate, offer, acceptedVersion }: ConversionData) => {
      // Create employee from candidate and offer version data
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .insert({
          first_name: candidate.first_name,
          last_name: candidate.last_name,
          email: candidate.email,
          phone: candidate.phone,
          nationality: candidate.nationality,
          department_id: acceptedVersion.department_id,
          position_id: acceptedVersion.position_id,
          work_location_id: acceptedVersion.work_location_id,
          manager_id: acceptedVersion.manager_employee_id,
          join_date: acceptedVersion.start_date,
          salary: acceptedVersion.basic_salary,
          salary_currency_code: acceptedVersion.currency_code,
          status: 'active',
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Create employee allowances for housing, transport, and other
      const allowancesToCreate = [];
      
      if (acceptedVersion.housing_allowance > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Housing Allowance',
          custom_amount: acceptedVersion.housing_allowance,
          effective_date: acceptedVersion.start_date,
        });
      }
      
      if (acceptedVersion.transport_allowance > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Transport Allowance',
          custom_amount: acceptedVersion.transport_allowance,
          effective_date: acceptedVersion.start_date,
        });
      }
      
      if (acceptedVersion.other_allowances > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Other Allowances',
          custom_amount: acceptedVersion.other_allowances,
          effective_date: acceptedVersion.start_date,
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
          candidate_id: candidate.id,
          offer_id: offer.id,
          offer_version_id: acceptedVersion.id,
          employee_id: employee.id,
        });

      if (logError) {
        console.error("Failed to log conversion:", logError);
      }

      // Archive the candidate
      await supabase
        .from("candidates")
        .update({ status: 'archived' })
        .eq("id", candidate.id);

      // Archive the offer
      await supabase
        .from("offers")
        .update({ status: 'archived' })
        .eq("id", offer.id);

      return employee;
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
