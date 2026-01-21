import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HierarchicalCalendar } from "@/components/ui/hierarchical-calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRequestLoan } from "@/hooks/useLoans";
import { useInitiateApproval } from "@/hooks/useApprovalEngine";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { toast } from "sonner";

const formSchema = z.object({
  principal_amount: z.coerce.number().positive("Loan amount must be positive"),
  repayment_method: z.enum(["duration", "installment"]),
  duration_months: z.coerce.number().int().positive().optional(),
  installment_amount: z.coerce.number().positive().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.repayment_method === "duration") {
      return data.duration_months && data.duration_months > 0;
    }
    return data.installment_amount && data.installment_amount > 0;
  },
  {
    message: "Please provide duration or installment amount",
    path: ["duration_months"],
  }
);

type FormData = z.infer<typeof formSchema>;

interface EmployeeRequestLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeRequestLoanDialog({ open, onOpenChange }: EmployeeRequestLoanDialogProps) {
  const requestLoan = useRequestLoan();
  const initiateApproval = useInitiateApproval();
  const { getCurrencySymbol } = useCompanySettings();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal_amount: 0,
      repayment_method: "duration",
      duration_months: 12,
      notes: "",
    },
  });

  const repaymentMethod = form.watch("repayment_method");
  const principalAmount = form.watch("principal_amount");
  const durationMonths = form.watch("duration_months");
  const installmentAmount = form.watch("installment_amount");

  const calculatedInstallment = repaymentMethod === "duration" && durationMonths && principalAmount
    ? (principalAmount / durationMonths).toFixed(2)
    : null;
  const calculatedDuration = repaymentMethod === "installment" && installmentAmount && principalAmount
    ? Math.ceil(principalAmount / installmentAmount)
    : null;

  const onSubmit = async (data: FormData) => {
    try {
      const loan = await requestLoan.mutateAsync({
        principal_amount: data.principal_amount,
        duration_months: data.repayment_method === "duration" ? data.duration_months : undefined,
        installment_amount: data.repayment_method === "installment" ? data.installment_amount : undefined,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        deduct_from_payroll: true, // Default, HR will set the actual value
        notes: data.notes,
      });

      // Initiate approval workflow
      if (loan?.id && loan?.employee_id) {
        await initiateApproval.mutateAsync({
          requestId: loan.id,
          requestType: "loan",
          employeeId: loan.employee_id,
        });
      }

      toast.success("Loan request submitted successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to submit loan request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Loan</DialogTitle>
          <DialogDescription>
            Submit a loan request for HR approval. You'll be notified once it's reviewed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="principal_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount ({getCurrencySymbol()})</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repayment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repayment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="duration" id="emp-duration" />
                        <Label htmlFor="emp-duration">By Duration</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="installment" id="emp-installment" />
                        <Label htmlFor="emp-installment">By Installment Amount</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {repaymentMethod === "duration" ? (
              <FormField
                control={form.control}
                name="duration_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Months)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    {calculatedInstallment && (
                      <FormDescription>
                        Estimated monthly installment: {getCurrencySymbol()} {calculatedInstallment}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="installment_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Installment ({getCurrencySymbol()})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    {calculatedDuration && (
                      <FormDescription>
                        Number of installments: {calculatedDuration}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <HierarchicalCalendar
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason / Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain the purpose of this loan..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={requestLoan.isPending}>
                {requestLoan.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
