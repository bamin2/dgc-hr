import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2, Upload, Loader2, FileText, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  useUpdateBenefitPlan, 
  useUpdateCoverageLevels,
  type BenefitPlan, 
  type BenefitType, 
  type BenefitStatus,
  type AirTicketConfig,
  type PhoneConfig,
  type EntitlementConfig,
  type CoverageLevelDetails
} from '@/hooks/useBenefitPlans';
import { useBenefitDocumentUpload } from '@/hooks/useBenefitDocumentUpload';
import { PhoneConfigFields } from './EntitlementConfigFields';

const formSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  type: z.enum(['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'wellness', 'air_ticket', 'car_park', 'phone', 'other'] as const),
  provider: z.string().min(1, 'Provider is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending'] as const),
  features: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CoverageLevel {
  id?: string;
  name: string;
  employee_cost: number;
  employer_cost: number;
  // Air ticket specific fields
  tickets_per_period?: number;
  period_years?: number;
}

interface EditBenefitPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: BenefitPlan;
}

export function EditBenefitPlanDialog({ open, onOpenChange, plan }: EditBenefitPlanDialogProps) {
  const { toast } = useToast();
  const updatePlan = useUpdateBenefitPlan();
  const updateCoverageLevels = useUpdateCoverageLevels();
  const { uploadDocument, isUploading } = useBenefitDocumentUpload();
  
  const [coverageLevels, setCoverageLevels] = useState<CoverageLevel[]>([]);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  
  // Phone config state (plan-level)
  const [phoneConfig, setPhoneConfig] = useState<PhoneConfig>({
    total_device_cost: 0,
    monthly_installment: 0,
    installment_months: 24,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'health',
      provider: '',
      description: '',
      status: 'active',
      features: '',
    },
  });

  const watchedType = form.watch('type');
  const isAirTicketType = watchedType === 'air_ticket';

  // Initialize form with plan data when dialog opens
  useEffect(() => {
    if (open && plan) {
      form.reset({
        name: plan.name,
        type: plan.type,
        provider: plan.provider,
        description: plan.description || '',
        status: plan.status,
        features: plan.features?.join('\n') || '',
      });
      
      // Initialize coverage levels with air ticket config from coverage_details
      setCoverageLevels(
        (plan.coverage_levels || []).map(cl => {
          const details = cl.coverage_details as CoverageLevelDetails | null;
          return {
            id: cl.id,
            name: cl.name,
            employee_cost: cl.employee_cost,
            employer_cost: cl.employer_cost,
            // Load air ticket config from coverage_details
            tickets_per_period: details?.tickets_per_period ?? 1,
            period_years: details?.period_years ?? 2,
          };
        })
      );
      
      setExpiryDate(plan.expiry_date ? parseISO(plan.expiry_date) : undefined);
      setPolicyFile(null);
      
      // Initialize phone config from plan-level entitlement_config
      const config = plan.entitlement_config;
      if (plan.type === 'phone' && config) {
        setPhoneConfig({
          total_device_cost: (config as PhoneConfig).total_device_cost || 0,
          monthly_installment: (config as PhoneConfig).monthly_installment || 0,
          installment_months: (config as PhoneConfig).installment_months || 24,
        });
      }
    }
  }, [open, plan, form]);

  const addCoverageLevel = () => {
    const newLevel: CoverageLevel = { 
      name: '', 
      employee_cost: 0, 
      employer_cost: 0,
      ...(isAirTicketType ? { tickets_per_period: 1, period_years: 2 } : {})
    };
    setCoverageLevels([...coverageLevels, newLevel]);
  };

  const removeCoverageLevel = (index: number) => {
    setCoverageLevels(coverageLevels.filter((_, i) => i !== index));
  };

  const updateCoverageLevel = (index: number, field: keyof CoverageLevel, value: string | number) => {
    const updated = [...coverageLevels];
    updated[index] = { ...updated[index], [field]: value };
    setCoverageLevels(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or Word document',
          variant: 'destructive',
        });
        return;
      }
      setPolicyFile(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      // Parse features from textarea (one per line)
      const features = values.features
        ? values.features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
        : [];

      // Filter out incomplete coverage levels and map to proper format
      const validCoverageLevels = coverageLevels
        .filter(level => level.name.trim().length > 0)
        .map(level => {
          // For air ticket plans, store config in coverage_details
          const coverage_details: CoverageLevelDetails | undefined = 
            values.type === 'air_ticket' 
              ? {
                  tickets_per_period: level.tickets_per_period || 1,
                  period_years: level.period_years || 2,
                }
              : undefined;

          return {
            id: level.id,
            name: level.name,
            employee_cost: level.employee_cost,
            employer_cost: level.employer_cost,
            coverage_details,
          };
        });

      // Build entitlement config based on type (only for phone now - air ticket uses coverage level)
      let entitlement_config: EntitlementConfig | undefined;
      if (values.type === 'phone') {
        entitlement_config = phoneConfig;
      }

      // Update the plan
      await updatePlan.mutateAsync({
        id: plan.id,
        name: values.name,
        type: values.type as BenefitType,
        provider: values.provider,
        description: values.description || null,
        status: values.status as BenefitStatus,
        features,
        expiry_date: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : null,
        entitlement_config,
      });

      // Update coverage levels
      const originalLevelIds = (plan.coverage_levels || []).map(cl => cl.id);
      const result = await updateCoverageLevels.mutateAsync({
        planId: plan.id,
        coverageLevels: validCoverageLevels,
        originalLevelIds,
      });

      // Upload new policy document if provided
      if (policyFile) {
        const documentUrl = await uploadDocument(policyFile, plan.id);
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('benefit_plans')
          .update({ policy_document_url: documentUrl })
          .eq('id', plan.id);
      }

      // Show warning if some coverage levels couldn't be deleted
      if (result?.skippedLevels?.length > 0) {
        toast({
          title: 'Some coverage levels were not removed',
          description: `${result.skippedLevels.length} coverage level(s) could not be removed because employees are currently enrolled in them.`,
        });
      }

      toast({
        title: 'Benefit Plan Updated',
        description: `${values.name} has been updated successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating benefit plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update benefit plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = updatePlan.isPending || updateCoverageLevels.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Benefit Plan</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Plan Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Plan Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Premium Health Plus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="dental">Dental</SelectItem>
                          <SelectItem value="vision">Vision</SelectItem>
                          <SelectItem value="life">Life</SelectItem>
                          <SelectItem value="disability">Disability</SelectItem>
                          <SelectItem value="retirement">Retirement</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="air_ticket">Air Ticket</SelectItem>
                          <SelectItem value="car_park">Car Park</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Blue Cross Blue Shield" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the benefit plan..." 
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Preventive care covered 100%&#10;Low deductible options&#10;Nationwide provider network" 
                        className="resize-none"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Coverage Levels */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {isAirTicketType ? "Coverage Levels & Entitlements" : "Coverage Levels"}
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addCoverageLevel}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Level
                </Button>
              </div>

              {coverageLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  No coverage levels added. Click "Add Level" to create coverage options.
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Header row for air ticket plans */}
                  {isAirTicketType && coverageLevels.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 px-3 text-xs font-medium text-muted-foreground">
                      <span>Level Name</span>
                      <span>Employee Cost</span>
                      <span>Employer Cost</span>
                      <span>Tickets</span>
                      <span>Period (Years)</span>
                    </div>
                  )}
                  {coverageLevels.map((level, index) => (
                    <div key={level.id || index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={cn(
                        "flex-1 grid gap-3",
                        isAirTicketType 
                          ? "grid-cols-1 md:grid-cols-5" 
                          : "grid-cols-1 md:grid-cols-3"
                      )}>
                        <Input
                          placeholder="Level name (e.g., Senior Staff)"
                          value={level.name}
                          onChange={(e) => updateCoverageLevel(index, 'name', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Employee cost"
                          value={level.employee_cost || ''}
                          onChange={(e) => updateCoverageLevel(index, 'employee_cost', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Employer cost"
                          value={level.employer_cost || ''}
                          onChange={(e) => updateCoverageLevel(index, 'employer_cost', parseFloat(e.target.value) || 0)}
                        />
                        {isAirTicketType && (
                          <>
                            <Input
                              type="number"
                              min={1}
                              placeholder="Tickets"
                              value={level.tickets_per_period || ''}
                              onChange={(e) => updateCoverageLevel(index, 'tickets_per_period', parseInt(e.target.value) || 1)}
                            />
                            <Input
                              type="number"
                              min={1}
                              placeholder="Years"
                              value={level.period_years || ''}
                              onChange={(e) => updateCoverageLevel(index, 'period_years', parseInt(e.target.value) || 1)}
                            />
                          </>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeCoverageLevel(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Configuration (plan-level) */}
            {watchedType === 'phone' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Phone Configuration</h3>
                <PhoneConfigFields 
                  config={phoneConfig} 
                  onChange={setPhoneConfig} 
                />
              </div>
            )}

            {/* Policy Document Upload */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Policy Document</h3>
              
              {plan.policy_document_url && !policyFile && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1">Current document attached</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={plan.policy_document_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              )}
              
              <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
                {policyFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{policyFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(policyFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPolicyFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {plan.policy_document_url ? 'Upload a new policy document to replace the existing one' : 'Upload a policy document (PDF, DOC, DOCX)'}
                    </p>
                    <label htmlFor="policy-upload-edit">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                      <input
                        id="policy-upload-edit"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
