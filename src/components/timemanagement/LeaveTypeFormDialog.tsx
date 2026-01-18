import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeaveType, SalaryDeductionTier, useCreateLeaveType, useUpdateLeaveType } from "@/hooks/useLeaveTypes";
import { Plus, Trash2 } from "lucide-react";
import { PublicHolidaysSection } from "./PublicHolidaysSection";

const tierSchema = z.object({
  from_days: z.coerce.number().min(0, "Must be 0 or greater"),
  to_days: z.coerce.number().min(1, "Must be at least 1"),
  deduction_percentage: z.coerce.number().min(0).max(100, "Must be 0-100"),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  max_days_per_year: z.coerce.number().min(0).optional().nullable(),
  is_paid: z.boolean(),
  requires_approval: z.boolean(),
  is_active: z.boolean(),
  // Policy settings
  count_weekends: z.boolean(),
  requires_document: z.boolean(),
  document_required_after_days: z.coerce.number().min(1).optional().nullable(),
  visible_to_employees: z.boolean(),
  allow_carryover: z.boolean(),
  max_carryover_days: z.coerce.number().min(0).optional().nullable(),
  min_days_notice: z.coerce.number().min(0).optional(),
  max_consecutive_days: z.coerce.number().min(1).optional().nullable(),
  // Salary deduction settings
  has_salary_deduction: z.boolean(),
  salary_deduction_tiers: z.array(tierSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface LeaveTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType & {
    count_weekends?: boolean;
    requires_document?: boolean;
    document_required_after_days?: number | null;
    visible_to_employees?: boolean;
    allow_carryover?: boolean;
    max_carryover_days?: number | null;
    min_days_notice?: number;
    max_consecutive_days?: number | null;
    has_salary_deduction?: boolean;
    salary_deduction_tiers?: SalaryDeductionTier[] | null;
  };
}

const colorOptions = [
  { value: '#14b8a6', label: 'Teal' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#C6A45E', label: 'Gold' },
  { value: '#6B8E7B', label: 'Sage' },
  { value: '#F87171', label: 'Coral' },
  { value: '#78716C', label: 'Stone' },
];

export function LeaveTypeFormDialog({
  open,
  onOpenChange,
  leaveType,
}: LeaveTypeFormDialogProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "holidays">("settings");
  const createLeaveType = useCreateLeaveType();
  const updateLeaveType = useUpdateLeaveType();
  const isEditing = !!leaveType;
  const isPublicHolidayType = leaveType?.name?.toLowerCase() === 'public holiday';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: leaveType?.name || "",
      description: leaveType?.description || "",
      color: leaveType?.color || "#14b8a6",
      max_days_per_year: leaveType?.max_days_per_year || null,
      is_paid: leaveType?.is_paid ?? true,
      requires_approval: leaveType?.requires_approval ?? true,
      is_active: leaveType?.is_active ?? true,
      count_weekends: leaveType?.count_weekends ?? false,
      requires_document: leaveType?.requires_document ?? false,
      document_required_after_days: leaveType?.document_required_after_days || null,
      visible_to_employees: leaveType?.visible_to_employees ?? true,
      allow_carryover: leaveType?.allow_carryover ?? false,
      max_carryover_days: leaveType?.max_carryover_days || null,
      min_days_notice: leaveType?.min_days_notice ?? 1,
      max_consecutive_days: leaveType?.max_consecutive_days || null,
      has_salary_deduction: leaveType?.has_salary_deduction ?? false,
      salary_deduction_tiers: leaveType?.salary_deduction_tiers || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "salary_deduction_tiers",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Ensure tiers have proper numeric values
      const cleanedTiers: SalaryDeductionTier[] = values.salary_deduction_tiers.map(tier => ({
        from_days: Number(tier.from_days),
        to_days: Number(tier.to_days),
        deduction_percentage: Number(tier.deduction_percentage),
      }));

      const payload = {
        ...values,
        salary_deduction_tiers: cleanedTiers,
      };

      if (isEditing) {
        await updateLeaveType.mutateAsync({
          id: leaveType.id,
          ...payload,
        });
      } else {
        await createLeaveType.mutateAsync(payload as any);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const requiresDocument = form.watch("requires_document");
  const allowCarryover = form.watch("allow_carryover");
  const hasSalaryDeduction = form.watch("has_salary_deduction");

  const addTier = () => {
    const lastTier = fields[fields.length - 1];
    const nextFromDays = lastTier ? lastTier.to_days + 1 : 0;
    append({
      from_days: nextFromDays,
      to_days: nextFromDays + 15,
      deduction_percentage: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Leave Type" : "Create Leave Type"}
          </DialogTitle>
        </DialogHeader>

        {isPublicHolidayType && isEditing ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "settings" | "holidays")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="holidays">Public Holidays</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderFormFields()}
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="holidays" className="mt-4">
              <PublicHolidaysSection />
            </TabsContent>
          </Tabs>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderFormFields()}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );

  function renderFormFields() {
    return (
      <>
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Annual Leave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                field.value === color.value
                                  ? 'border-foreground scale-110'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this leave type..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="max_days_per_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Days Per Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>Leave empty for unlimited</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_days_notice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Notice (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Leave Rules */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Leave Rules</h3>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="is_paid"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Paid Leave</FormLabel>
                        <FormDescription className="text-xs">
                          Employee receives salary during this leave
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requires_approval"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Requires Approval</FormLabel>
                        <FormDescription className="text-xs">
                          Manager must approve this leave request
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="count_weekends"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Count Weekends</FormLabel>
                        <FormDescription className="text-xs">
                          Include weekends in leave day calculation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visible_to_employees"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Visible to Employees</FormLabel>
                        <FormDescription className="text-xs">
                          Show this leave type to employees
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Document Requirements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Document Requirements</h3>

              <FormField
                control={form.control}
                name="requires_document"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Requires Supporting Document</FormLabel>
                      <FormDescription className="text-xs">
                        Employee must upload a document (e.g., medical certificate)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {requiresDocument && (
                <FormField
                  control={form.control}
                  name="document_required_after_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Only Required After (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 3"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to always require. Set a number to only require for leaves longer than X days.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Carryover Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Carryover Policy</h3>

              <FormField
                control={form.control}
                name="allow_carryover"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Allow Carryover</FormLabel>
                      <FormDescription className="text-xs">
                        Unused days can be carried to next year
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {allowCarryover && (
                <FormField
                  control={form.control}
                  name="max_carryover_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Carryover Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited carryover
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Salary Deduction Policy */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Salary Deduction Policy</h3>

              <FormField
                control={form.control}
                name="has_salary_deduction"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Enable Salary Deductions</FormLabel>
                      <FormDescription className="text-xs">
                        Apply salary deductions based on days utilized
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {hasSalaryDeduction && (
                <div className="space-y-3">
                  <FormDescription>
                    Configure deduction tiers based on total days utilized. The deduction percentage will be applied to salary when the employee's usage falls within that range.
                  </FormDescription>

                  {fields.length > 0 && (
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 p-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                        <span>From Days</span>
                        <span>To Days</span>
                        <span>Deduction %</span>
                        <span className="w-8"></span>
                      </div>
                      <div className="divide-y">
                        {fields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 p-3 items-center">
                            <FormField
                              control={form.control}
                              name={`salary_deduction_tiers.${index}.from_days`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="h-9"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`salary_deduction_tiers.${index}.to_days`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      className="h-9"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`salary_deduction_tiers.${index}.deduction_percentage`}
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        className="h-9 pr-8"
                                        {...field}
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                        %
                                      </span>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={addTier}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Active</FormLabel>
                    <FormDescription className="text-xs">
                      Inactive leave types are hidden from use
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLeaveType.isPending || updateLeaveType.isPending}
              >
                {isEditing ? "Save Changes" : "Create Leave Type"}
              </Button>
            </div>
          </>
        );
      }
}
