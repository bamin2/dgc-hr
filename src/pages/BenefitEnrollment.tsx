import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EnrollmentForm } from '@/components/benefits';
import { useCreateBenefitEnrollment } from '@/hooks/useBenefitEnrollments';
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
  }) => {
    try {
      await createEnrollment.mutateAsync({
        employee_id: data.employeeId,
        plan_id: data.planId,
        coverage_level_id: data.coverageLevelId,
        start_date: format(data.startDate, 'yyyy-MM-dd'),
        employee_contribution: data.coverageLevel.employee_cost,
        employer_contribution: data.coverageLevel.employer_cost,
      });
      
      toast({
        title: 'Enrollment Successful',
        description: 'The employee has been enrolled in the benefit plan.'
      });
      navigate('/benefits');
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
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/benefits')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Benefits
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Enrollment</h1>
          <p className="text-muted-foreground">Enroll an employee in a benefit plan</p>
        </div>

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
