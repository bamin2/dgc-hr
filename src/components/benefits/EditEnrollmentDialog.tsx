import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Loader2, Users, Pencil, Car } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { DependentsDialog, type Dependent } from './DependentsDialog';
import type { BenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { useUpdateBenefitEnrollment, useUpdateBeneficiaries } from '@/hooks/useBenefitEnrollments';
import { useBenefitPlan } from '@/hooks/useBenefitPlans';
import { useToast } from '@/hooks/use-toast';
import type { CarParkData } from '@/types/benefits';

interface EditEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: BenefitEnrollment | null;
}

export const EditEnrollmentDialog = ({
  open,
  onOpenChange,
  enrollment,
}: EditEnrollmentDialogProps) => {
  const { toast } = useToast();
  const updateEnrollment = useUpdateBenefitEnrollment();
  const updateBeneficiaries = useUpdateBeneficiaries();

  // Fetch the full plan with all coverage levels
  const { data: fullPlan } = useBenefitPlan(enrollment?.plan_id);

  // Form state
  const [selectedCoverageLevelId, setSelectedCoverageLevelId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [beneficiaries, setBeneficiaries] = useState<Dependent[]>([]);
  const [dependentsDialogOpen, setDependentsDialogOpen] = useState(false);
  const [spotLocation, setSpotLocation] = useState('');

  // Reset form when enrollment changes
  useEffect(() => {
    if (enrollment) {
      setSelectedCoverageLevelId(enrollment.coverage_level_id);
      setStartDate(new Date(enrollment.start_date));
      setEndDate(enrollment.end_date ? new Date(enrollment.end_date) : undefined);
      setBeneficiaries(
        enrollment.beneficiaries?.map(b => ({
          name: b.name,
          relationship: b.relationship,
          nationalId: b.national_id || undefined,
        })) || []
      );
      // Load spot location from entitlement_data for car park plans
      const entitlementData = enrollment.entitlement_data as CarParkData | null;
      setSpotLocation(entitlementData?.spot_location || '');
    }
  }, [enrollment]);

  if (!enrollment) return null;

  const employee = enrollment.employee;
  const plan = enrollment.plan;
  const coverageLevels = fullPlan?.coverage_levels || [];
  const isCarParkPlan = plan?.type === 'car_park';

  // Get current selected coverage level
  const selectedCoverageLevel = coverageLevels.find(c => c.id === selectedCoverageLevelId);
  const employeeCost = selectedCoverageLevel?.employee_cost ?? enrollment.employee_contribution;
  const employerCost = selectedCoverageLevel?.employer_cost ?? enrollment.employer_contribution;
  const totalCost = employeeCost + employerCost;

  // Format using plan's currency
  const planCurrency = plan?.currency || 'BHD';
  const formatPlanCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: planCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSave = async () => {
    if (!enrollment || !selectedCoverageLevelId || !startDate) return;

    try {
      // Build entitlement_data for car park plans
      let entitlementData = enrollment.entitlement_data;
      if (isCarParkPlan) {
        entitlementData = {
          ...((entitlementData as Record<string, unknown>) || {}),
          spot_location: spotLocation || null,
        };
      }

      // Update enrollment
      await updateEnrollment.mutateAsync({
        id: enrollment.id,
        coverage_level_id: selectedCoverageLevelId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        employee_contribution: employeeCost,
        employer_contribution: employerCost,
        entitlement_data: entitlementData,
      });

      // Update beneficiaries
      await updateBeneficiaries.mutateAsync({
        enrollmentId: enrollment.id,
        beneficiaries: beneficiaries.map(b => ({
          name: b.name,
          relationship: b.relationship,
          national_id: b.nationalId,
        })),
      });

      toast({
        title: 'Enrollment Updated',
        description: 'The enrollment has been updated successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update enrollment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = updateEnrollment.isPending || updateBeneficiaries.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="lg" className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Employee Info - Read Only */}
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee?.avatar_url || undefined} />
                <AvatarFallback>
                  {employee?.first_name?.[0] || ''}{employee?.last_name?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {employee?.first_name} {employee?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {employee?.department?.name || 'No department'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Plan Info - Read Only */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Plan</Label>
              <div className="flex items-center gap-2">
                {plan?.type && <BenefitTypeBadge type={plan.type as any} />}
                <span className="font-medium">{plan?.name || 'Unknown plan'}</span>
              </div>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="space-y-4">
              {/* Coverage Level */}
              <div className="space-y-2">
                <Label htmlFor="coverage-level">Coverage Level</Label>
                <Select value={selectedCoverageLevelId} onValueChange={setSelectedCoverageLevelId}>
                  <SelectTrigger id="coverage-level">
                    <SelectValue placeholder="Select coverage level" />
                  </SelectTrigger>
                  <SelectContent>
                    {coverageLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name} - {formatPlanCurrency(level.employee_cost + level.employer_cost)}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'No end date (ongoing)'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                    {endDate && (
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setEndDate(undefined)}
                        >
                          Clear end date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Car Park Spot Location */}
            {isCarParkPlan && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Car className="h-4 w-4" />
                    <Label className="font-medium">Car Park Assignment</Label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Building A - Level 2, Spot 45"
                      value={spotLocation}
                      onChange={(e) => setSpotLocation(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The assigned parking spot location for this employee.
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Beneficiaries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Beneficiaries ({beneficiaries.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDependentsDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              {beneficiaries.length > 0 ? (
                <div className="space-y-2">
                  {beneficiaries.map((b, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{b.relationship}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No beneficiaries added</p>
              )}
            </div>

            <Separator />

            {/* Cost Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employee pays</span>
                <span className="font-medium">{formatPlanCurrency(employeeCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employer pays</span>
                <span className="font-medium text-emerald-600">{formatPlanCurrency(employerCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total Monthly Cost</span>
                <span className="font-semibold">{formatPlanCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="liquidGlassSecondary" size="liquidGlass" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="liquidGlass" size="liquidGlass" onClick={handleSave} disabled={isLoading || !selectedCoverageLevelId || !startDate}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DependentsDialog
        open={dependentsDialogOpen}
        onOpenChange={setDependentsDialogOpen}
        employeeName={`${employee?.first_name} ${employee?.last_name}`}
        initialDependents={beneficiaries}
        onConfirm={setBeneficiaries}
      />
    </>
  );
};
