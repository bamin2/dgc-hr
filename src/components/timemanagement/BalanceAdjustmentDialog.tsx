import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AllEmployeeBalance, useCreateLeaveBalanceAdjustment } from "@/hooks/useLeaveBalanceAdjustments";

const formSchema = z.object({
  adjustment_days: z.coerce.number().refine((val) => val !== 0, {
    message: "Adjustment cannot be zero",
  }),
  adjustment_type: z.enum(["manual", "carryover", "expiry", "correction"]),
  reason: z.string().min(1, "Reason is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface BalanceAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: AllEmployeeBalance;
  balance: AllEmployeeBalance["balances"][0];
}

const adjustmentTypeLabels = {
  manual: "Manual Adjustment",
  carryover: "Carryover from Previous Year",
  expiry: "Expiry/Forfeit",
  correction: "Correction/Error Fix",
};

export function BalanceAdjustmentDialog({
  open,
  onOpenChange,
  employee,
  balance,
}: BalanceAdjustmentDialogProps) {
  const createAdjustment = useCreateLeaveBalanceAdjustment();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjustment_days: 0,
      adjustment_type: "manual",
      reason: "",
    },
  });

  const adjustmentDays = form.watch("adjustment_days");
  const newTotal = balance.total_days + (Number(adjustmentDays) || 0);

  const onSubmit = async (values: FormValues) => {
    try {
      await createAdjustment.mutateAsync({
        leave_balance_id: balance.balance_id,
        employee_id: employee.employee_id,
        leave_type_id: balance.leave_type_id,
        adjustment_days: values.adjustment_days,
        adjustment_type: values.adjustment_type,
        reason: values.reason,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Adjust Leave Balance</DialogTitle>
          <DialogDescription>
            Modify the leave balance for this employee
          </DialogDescription>
        </DialogHeader>

        {/* Employee Info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarImage src={employee.employee_avatar || undefined} />
            <AvatarFallback>
              {employee.employee_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{employee.employee_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: balance.leave_type_color || '#6b7280' }}
              />
              <span className="text-xs text-muted-foreground">
                {balance.leave_type_name}
              </span>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="grid grid-cols-3 gap-4 text-center py-2">
          <div>
            <p className="text-2xl font-semibold">{balance.total_days}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-muted-foreground">
              {balance.used_days}
            </p>
            <p className="text-xs text-muted-foreground">Used</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-success">
              {balance.remaining_days}
            </p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(adjustmentTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="adjustment_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5 or -3"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use positive numbers to add days, negative to deduct
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {adjustmentDays !== 0 && (
              <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded">
                <span className="text-sm text-muted-foreground">
                  New total:
                </span>
                <Badge
                  variant={adjustmentDays > 0 ? "default" : "destructive"}
                  className="text-sm"
                >
                  {newTotal} days
                </Badge>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this adjustment..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAdjustment.isPending}>
                Apply Adjustment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
