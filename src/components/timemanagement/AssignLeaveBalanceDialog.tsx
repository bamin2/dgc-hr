import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCreateLeaveBalance } from "@/hooks/useLeaveBalanceAdjustments";
import { LeaveType } from "@/hooks/useLeaveTypes";

const formSchema = z.object({
  total_days: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignLeaveBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string | null;
  leaveType: LeaveType;
  year: number;
}

export function AssignLeaveBalanceDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  employeeAvatar,
  leaveType,
  year,
}: AssignLeaveBalanceDialogProps) {
  const createBalance = useCreateLeaveBalance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total_days: leaveType.max_days_per_year || 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createBalance.mutateAsync({
      employee_id: employeeId,
      leave_type_id: leaveType.id,
      year: year,
      total_days: values.total_days,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Assign Leave Balance</DialogTitle>
          <DialogDescription>
            Assign initial leave balance for {year}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src={employeeAvatar || undefined} />
              <AvatarFallback>
                {employeeName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{employeeName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: leaveType.color || "#6b7280" }}
                />
                <span className="text-xs text-muted-foreground">
                  {leaveType.name}
                </span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="total_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Days for {year}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Enter total days"
                        {...field}
                      />
                    </FormControl>
                    {field.value < 0 && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Employee will start with a negative balance
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {leaveType.max_days_per_year && (
                <p className="text-xs text-muted-foreground">
                  Default allocation for {leaveType.name}:{" "}
                  <Badge variant="secondary" className="text-xs">
                    {leaveType.max_days_per_year} days
                  </Badge>
                </p>
              )}

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createBalance.isPending}>
                  {createBalance.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Assign Balance
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
