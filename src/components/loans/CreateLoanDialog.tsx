import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateLoan } from "@/hooks/useLoans";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { toast } from "sonner";

const formSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  principal_amount: z.coerce.number().positive("Principal amount must be positive"),
  repayment_method: z.enum(["duration", "installment"]),
  duration_months: z.coerce.number().int().positive().optional(),
  installment_amount: z.coerce.number().positive().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  deduct_from_payroll: z.boolean(),
  notes: z.string().optional(),
  auto_disburse: z.boolean(),
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

interface CreateLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedEmployeeId?: string;
}

export function CreateLoanDialog({ 
  open, 
  onOpenChange,
  preselectedEmployeeId,
}: CreateLoanDialogProps) {
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const createLoan = useCreateLoan();
  const { getCurrencySymbol } = useCompanySettings();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: preselectedEmployeeId || "",
      principal_amount: 0,
      repayment_method: "duration",
      duration_months: 12,
      deduct_from_payroll: true,
      notes: "",
      auto_disburse: true,
    },
  });

  useEffect(() => {
    if (preselectedEmployeeId) {
      form.setValue("employee_id", preselectedEmployeeId);
    }
  }, [preselectedEmployeeId, form]);

  const repaymentMethod = form.watch("repayment_method");
  const principalAmount = form.watch("principal_amount");
  const durationMonths = form.watch("duration_months");
  const installmentAmount = form.watch("installment_amount");

  // Calculate preview
  const calculatedInstallment = repaymentMethod === "duration" && durationMonths && principalAmount
    ? (principalAmount / durationMonths).toFixed(2)
    : null;
  const calculatedDuration = repaymentMethod === "installment" && installmentAmount && principalAmount
    ? Math.ceil(principalAmount / installmentAmount)
    : null;

  const onSubmit = async (data: FormData) => {
    // Prevent double submission
    if (createLoan.isPending) return;
    
    // Close dialog immediately to prevent double clicks
    onOpenChange(false);
    
    try {
      await createLoan.mutateAsync({
        employee_id: data.employee_id,
        principal_amount: data.principal_amount,
        duration_months: data.repayment_method === "duration" ? data.duration_months : undefined,
        installment_amount: data.repayment_method === "installment" ? data.installment_amount : undefined,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        deduct_from_payroll: data.deduct_from_payroll,
        notes: data.notes,
        auto_disburse: data.auto_disburse,
      });
      toast.success("Loan created successfully");
      form.reset();
    } catch (error) {
      toast.error("Failed to create loan");
    }
  };

  const activeEmployees = employees.filter(e => e.status === "active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Loan</DialogTitle>
          <DialogDescription>
            Create a new loan for an employee. The loan will be automatically approved.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name || `${emp.first_name} ${emp.last_name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principal_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount ({getCurrencySymbol()})</FormLabel>
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
                        <RadioGroupItem value="duration" id="duration" />
                        <Label htmlFor="duration">By Duration</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="installment" id="installment" />
                        <Label htmlFor="installment">By Installment Amount</Label>
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
                        Monthly installment: {getCurrencySymbol()} {calculatedInstallment}
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
                    <FormLabel>Installment Amount ({getCurrencySymbol()})</FormLabel>
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
                  <FormLabel>Start Date</FormLabel>
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
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    First installment will be due on this date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deduct_from_payroll"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Deduct from Payroll</FormLabel>
                    <FormDescription>
                      Automatically deduct installments during payroll processing
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_disburse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-Disburse</FormLabel>
                    <FormDescription>
                      Immediately disburse and generate installment schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this loan..."
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
              <Button type="submit" disabled={createLoan.isPending}>
                {createLoan.isPending ? "Creating..." : "Create Loan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
