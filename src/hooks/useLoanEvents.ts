import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LoanEvent {
  id: string;
  loan_id: string;
  event_type: 'disburse' | 'top_up' | 'restructure' | 'skip_installment' | 'manual_payment' | 'note';
  effective_date: string;
  amount_delta: number | null;
  new_installment_amount: number | null;
  new_duration_months: number | null;
  affected_installment_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export function useLoanEvents(loanId: string | null) {
  return useQuery({
    queryKey: ["loan-events", loanId],
    queryFn: async () => {
      if (!loanId) return [];
      
      const { data, error } = await supabase
        .from("loan_events")
        .select("*")
        .eq("loan_id", loanId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LoanEvent[];
    },
    enabled: !!loanId,
  });
}

export function useSkipInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      installmentId,
      loanId,
      reason = "Employee request",
    }: {
      installmentId: string;
      loanId: string;
      reason?: string;
    }) => {
      // Get the installment to skip
      const { data: installment, error: fetchError } = await supabase
        .from("loan_installments")
        .select("*")
        .eq("id", installmentId)
        .single();

      if (fetchError) throw fetchError;

      // Get the last due installment to determine new due date
      const { data: lastInstallment, error: lastError } = await supabase
        .from("loan_installments")
        .select("due_date, installment_number, schedule_version")
        .eq("loan_id", loanId)
        .eq("status", "due")
        .order("due_date", { ascending: false })
        .limit(1)
        .single();

      if (lastError && lastError.code !== "PGRST116") throw lastError;

      // Calculate new due date (1 month after last installment)
      const lastDueDate = lastInstallment 
        ? new Date(lastInstallment.due_date) 
        : new Date(installment.due_date);
      lastDueDate.setMonth(lastDueDate.getMonth() + 1);
      const newDueDate = lastDueDate.toISOString().split("T")[0];

      // Get max installment number
      const { data: maxNumData } = await supabase
        .from("loan_installments")
        .select("installment_number")
        .eq("loan_id", loanId)
        .order("installment_number", { ascending: false })
        .limit(1)
        .single();

      const newInstallmentNumber = (maxNumData?.installment_number || 0) + 1;
      const newScheduleVersion = (lastInstallment?.schedule_version || 1) + 1;

      // Mark the installment as skipped
      const { error: updateError } = await supabase
        .from("loan_installments")
        .update({
          status: "skipped",
          skipped_reason: reason,
        })
        .eq("id", installmentId);

      if (updateError) throw updateError;

      // Create a new installment at the end
      const { data: newInstallment, error: insertError } = await supabase
        .from("loan_installments")
        .insert({
          loan_id: loanId,
          installment_number: newInstallmentNumber,
          amount: installment.amount,
          due_date: newDueDate,
          status: "due",
          rescheduled_from_installment_id: installmentId,
          schedule_version: newScheduleVersion,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update loan duration
      const { data: loan } = await supabase
        .from("loans")
        .select("duration_months")
        .eq("id", loanId)
        .single();

      if (loan?.duration_months) {
        await supabase
          .from("loans")
          .update({ duration_months: loan.duration_months + 1 })
          .eq("id", loanId);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create loan event
      const { error: eventError } = await supabase
        .from("loan_events")
        .insert({
          loan_id: loanId,
          event_type: "skip_installment",
          effective_date: installment.due_date,
          affected_installment_id: installmentId,
          notes: reason,
          created_by: user?.id,
        });

      if (eventError) throw eventError;

      return newInstallment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-installments", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-events", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-installments-due-for-payroll"] });
    },
  });
}

interface RestructureParams {
  loanId: string;
  effectiveDate: string;
  topUpAmount?: number;
  newInstallmentAmount?: number;
  newDurationMonths?: number;
  notes?: string;
}

export function useRestructureLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loanId,
      effectiveDate,
      topUpAmount,
      newInstallmentAmount,
      newDurationMonths,
      notes,
    }: RestructureParams) => {
      // Get loan details
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("*, loan_installments(*)")
        .eq("id", loanId)
        .single();

      if (loanError) throw loanError;

      // Calculate outstanding balance
      const paidInstallments = loan.loan_installments.filter(
        (i: any) => i.status === "paid" && new Date(i.due_date) < new Date(effectiveDate)
      );
      const paidAmount = paidInstallments.reduce((sum: number, i: any) => sum + Number(i.amount), 0);

      // Get all top-up events to calculate total principal
      const { data: topUpEvents } = await supabase
        .from("loan_events")
        .select("amount_delta")
        .eq("loan_id", loanId)
        .eq("event_type", "top_up");

      const totalTopUps = topUpEvents?.reduce((sum, e) => sum + (Number(e.amount_delta) || 0), 0) || 0;
      const totalPrincipal = Number(loan.principal_amount) + totalTopUps;
      const outstandingBalance = totalPrincipal - paidAmount;

      // New schedule principal
      const newPrincipal = outstandingBalance + (topUpAmount || 0);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create top-up event if applicable
      if (topUpAmount && topUpAmount > 0) {
        await supabase.from("loan_events").insert({
          loan_id: loanId,
          event_type: "top_up",
          effective_date: effectiveDate,
          amount_delta: topUpAmount,
          notes: `Top-up of ${topUpAmount}`,
          created_by: user?.id,
        });
      }

      // Mark future due installments as skipped
      const futureInstallments = loan.loan_installments.filter(
        (i: any) => i.status === "due" && new Date(i.due_date) >= new Date(effectiveDate)
      );

      for (const inst of futureInstallments) {
        await supabase
          .from("loan_installments")
          .update({
            status: "skipped",
            skipped_reason: "Restructured",
          })
          .eq("id", inst.id);
      }

      // Calculate new schedule
      let installmentAmount: number;
      let duration: number;

      if (newInstallmentAmount) {
        installmentAmount = newInstallmentAmount;
        duration = Math.ceil(newPrincipal / installmentAmount);
      } else if (newDurationMonths) {
        duration = newDurationMonths;
        installmentAmount = Math.floor((newPrincipal / duration) * 100) / 100;
      } else {
        throw new Error("Either new installment amount or duration must be provided");
      }

      // Get max installment number
      const maxInstallmentNum = Math.max(...loan.loan_installments.map((i: any) => i.installment_number), 0);
      const newScheduleVersion = Math.max(...loan.loan_installments.map((i: any) => i.schedule_version || 1), 1) + 1;

      // Generate new installments
      const newInstallments = [];
      let remainingAmount = newPrincipal;
      const startDate = new Date(effectiveDate);

      for (let i = 0; i < duration; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        const isLast = i === duration - 1;
        const amount = isLast ? remainingAmount : installmentAmount;
        remainingAmount -= amount;

        newInstallments.push({
          loan_id: loanId,
          installment_number: maxInstallmentNum + i + 1,
          amount: Math.round(amount * 100) / 100,
          due_date: dueDate.toISOString().split("T")[0],
          status: "due",
          schedule_version: newScheduleVersion,
        });
      }

      // Insert new installments
      const { error: insertError } = await supabase
        .from("loan_installments")
        .insert(newInstallments);

      if (insertError) throw insertError;

      // Update loan record
      await supabase
        .from("loans")
        .update({
          installment_amount: installmentAmount,
          duration_months: duration,
        })
        .eq("id", loanId);

      // Create restructure event
      await supabase.from("loan_events").insert({
        loan_id: loanId,
        event_type: "restructure",
        effective_date: effectiveDate,
        amount_delta: topUpAmount || null,
        new_installment_amount: installmentAmount,
        new_duration_months: duration,
        notes: notes || `Restructured: ${duration} months @ ${installmentAmount}/mo`,
        created_by: user?.id,
      });

      return { newPrincipal, duration, installmentAmount };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loan", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-installments", variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ["loan-events", variables.loanId] });
    },
  });
}
