import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { EntitlementTrackingCard } from './EntitlementTrackingCard';
import { InsuranceCardUpload } from './InsuranceCardUpload';
import { format } from 'date-fns';
import { Users, Calendar, DollarSign, Pencil, CreditCard } from 'lucide-react';
import type { BenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { useUpdateEnrollmentInsuranceCard, useUpdateBeneficiaryInsuranceCard } from '@/hooks/useBenefitEnrollments';
import type { BenefitType, AirTicketConfig, CarParkConfig, PhoneConfig, AirTicketData, PhoneData, CarParkData } from '@/types/benefits';

interface EnrollmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: BenefitEnrollment | null;
  onEdit?: (enrollment: BenefitEnrollment) => void;
}

export const EnrollmentDetailsDialog = ({
  open,
  onOpenChange,
  enrollment,
  onEdit,
}: EnrollmentDetailsDialogProps) => {
  if (!enrollment) return null;

  const employee = enrollment.employee;
  const plan = enrollment.plan;
  const coverageLevel = enrollment.coverage_level;
  const beneficiaries = enrollment.beneficiaries || [];
  const employeeName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();
  
  // Mutations for insurance card updates
  const updateEmployeeCard = useUpdateEnrollmentInsuranceCard();
  const updateBeneficiaryCard = useUpdateBeneficiaryInsuranceCard();
  
  // Check if this is a specialized entitlement type
  const isEntitlementType = ['air_ticket', 'car_park', 'phone'].includes(plan?.type || '');
  
  // Check if this is a health-related plan that should show insurance cards
  const isHealthPlan = ['health', 'dental', 'vision', 'life', 'disability'].includes(plan?.type || '');
  
  // Calculate costs including dependents (each dependent costs same as employee)
  const dependentsCount = beneficiaries.length;
  const totalPersons = 1 + dependentsCount;
  const baseEmployeeCost = enrollment.employee_contribution;
  const baseEmployerCost = enrollment.employer_contribution;
  const totalEmployeeCost = baseEmployeeCost * totalPersons;
  const totalEmployerCost = baseEmployerCost * totalPersons;
  const totalCost = totalEmployeeCost + totalEmployerCost;

  // Format using plan's currency
  const planCurrency = plan?.currency || 'BHD';
  const formatPlanCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: planCurrency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleEmployeeCardUpload = (url: string, expiryDate?: string) => {
    updateEmployeeCard.mutate({
      enrollmentId: enrollment.id,
      insuranceCardUrl: url,
      expiryDate,
    });
  };

  const handleBeneficiaryCardUpload = (beneficiaryId: string, url: string, expiryDate?: string) => {
    updateBeneficiaryCard.mutate({
      beneficiaryId,
      insuranceCardUrl: url,
      expiryDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle>Enrollment Details</DialogTitle>
          {enrollment.status === 'active' && onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(enrollment)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </DialogHeader>

        <DialogBody>
        <div className="space-y-6">
          {/* Employee Info */}
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
            <div className="ml-auto">
              <BenefitStatusBadge status={enrollment.status} />
            </div>
          </div>

          <Separator />

          {/* Plan Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Plan Details</h4>
            <div className="flex items-center gap-2">
              {plan?.type && <BenefitTypeBadge type={plan.type as any} />}
              <span className="font-medium">{plan?.name || 'Unknown plan'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Provider:</span>
                <span className="ml-2 font-medium">{plan?.provider || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Coverage:</span>
                <span className="ml-2 font-medium">{coverageLevel?.name || 'Standard'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Entitlement Tracking for specialized types */}
          {isEntitlementType && (plan?.entitlement_config || plan?.type === 'car_park') && (
            <>
              <EntitlementTrackingCard
                enrollmentId={enrollment.id}
                employeeName={employeeName}
                planType={plan.type as BenefitType}
                entitlementConfig={plan.entitlement_config as AirTicketConfig | CarParkConfig | PhoneConfig}
                entitlementData={enrollment.entitlement_data as unknown as AirTicketData | PhoneData | CarParkData | null}
                spotLocation={(enrollment.entitlement_data as CarParkData | null)?.spot_location}
              />
              <Separator />
            </>
          )}

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Enrollment Period
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Start Date:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(enrollment.start_date), 'MMM d, yyyy')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">End Date:</span>
                <span className="ml-2 font-medium">
                  {enrollment.end_date 
                    ? format(new Date(enrollment.end_date), 'MMM d, yyyy')
                    : 'Ongoing'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Costs */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Costs
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {/* Persons covered */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Persons Covered</span>
                <span className="font-medium">
                  1 Employee{dependentsCount > 0 && ` + ${dependentsCount} Dependent${dependentsCount > 1 ? 's' : ''}`} = {totalPersons}
                </span>
              </div>
              <Separator className="my-2" />
              {/* Per person costs */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employee pays (per person)</span>
                <span>{formatPlanCurrency(baseEmployeeCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Employer pays (per person)</span>
                <span className="text-emerald-600">{formatPlanCurrency(baseEmployerCost)}</span>
              </div>
              {dependentsCount > 0 && (
                <>
                  <Separator className="my-2" />
                  {/* Total breakdown */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Employee Total ({formatPlanCurrency(baseEmployeeCost)} × {totalPersons})</span>
                    <span className="font-medium">{formatPlanCurrency(totalEmployeeCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Employer Total ({formatPlanCurrency(baseEmployerCost)} × {totalPersons})</span>
                    <span className="font-medium text-emerald-600">{formatPlanCurrency(totalEmployerCost)}</span>
                  </div>
                </>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium">Total Monthly Cost</span>
                <span className="font-semibold">{formatPlanCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Beneficiaries */}
          {beneficiaries.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Beneficiaries ({beneficiaries.length})
                </h4>
                <div className="space-y-2">
                  {beneficiaries.map((beneficiary) => (
                    <div 
                      key={beneficiary.id} 
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{beneficiary.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {beneficiary.relationship}
                        </p>
                      </div>
                      {beneficiary.percentage && (
                        <Badge variant="secondary">{beneficiary.percentage}%</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Insurance Cards - Only for health-related plans */}
          {isHealthPlan && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Insurance Cards
                </h4>
                <div className="space-y-2">
                  {/* Employee's Card */}
                  <InsuranceCardUpload
                    label={`${employeeName}'s Card`}
                    currentUrl={enrollment.insurance_card_url}
                    currentExpiryDate={enrollment.insurance_card_expiry_date}
                    enrollmentId={enrollment.id}
                    onUploadComplete={handleEmployeeCardUpload}
                  />
                  
                  {/* Dependents' Cards */}
                  {beneficiaries.map((beneficiary) => (
                    <InsuranceCardUpload
                      key={beneficiary.id}
                      label={`${beneficiary.name}'s Card (${beneficiary.relationship})`}
                      currentUrl={beneficiary.insurance_card_url}
                      currentExpiryDate={beneficiary.insurance_card_expiry_date}
                      enrollmentId={enrollment.id}
                      beneficiaryId={beneficiary.id}
                      onUploadComplete={(url, expiryDate) => handleBeneficiaryCardUpload(beneficiary.id, url, expiryDate)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
