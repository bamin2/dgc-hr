import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EnrollmentForm } from '@/components/benefits';
import { useCreateBenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { useBenefitPlan, type AirTicketConfig, type PhoneConfig } from '@/hooks/useBenefitPlans';
import { initializeAirTicketData, initializePhoneData } from '@/hooks/useBenefitTracking';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const BenefitEnrollment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createEnrollment = useCreateBenefitEnrollment();

  const handleSubmit = async (data: {
    employeeId: string;
    planId: string;
    coverageLevelId: string;
    coverageLevel: { employee_cost: number; employer_cost: number };
    startDate: Date;
    planType?: string;
    entitlementConfig?: Record<string, unknown>;
    dependents?: Array<{ name: string; relationship: string; nationalId?: string }>;
    spotLocation?: string;
  }) => {
    // Initialize entitlement data based on plan type
    let entitlementData: Record<string, unknown> | undefined;
    const startDateStr = format(data.startDate, 'yyyy-MM-dd');
    
    if (data.planType === 'air_ticket' && data.entitlementConfig) {
      entitlementData = initializeAirTicketData(startDateStr) as unknown as Record<string, unknown>;
    } else if (data.planType === 'phone' && data.entitlementConfig) {
      const config = data.entitlementConfig as unknown as PhoneConfig;
      entitlementData = initializePhoneData(config.total_device_cost) as unknown as Record<string, unknown>;
    } else if (data.planType === 'car_park') {
      // Store spot location in entitlement_data for car park enrollments
      entitlementData = {
        spot_location: data.spotLocation || null,
      };
    }

    try {
      await createEnrollment.mutateAsync({
        employee_id: data.employeeId,
        plan_id: data.planId,
        coverage_level_id: data.coverageLevelId,
        start_date: startDateStr,
        employee_contribution: data.coverageLevel.employee_cost,
        employer_contribution: data.coverageLevel.employer_cost,
        entitlement_data: entitlementData,
        beneficiaries: data.dependents?.map(d => ({
          name: d.name,
          relationship: d.relationship,
          national_id: d.nationalId,
        })),
      });
      
      toast({
        title: 'Enrollment Successful',
        description: 'The employee has been enrolled in the benefit plan.'
      });
      navigate('/benefits?tab=enrollments');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enroll employee. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/benefits')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Benefits
        </Button>

        <PageHeader
          title="New Enrollment"
          subtitle="Enroll an employee in a benefit plan"
        />

        {/* Form */}
        <EnrollmentForm 
          onSubmit={handleSubmit}
          onCancel={() => navigate('/benefits')}
        />
      </div>
    </DashboardLayout>
  );
};

export default BenefitEnrollment;
