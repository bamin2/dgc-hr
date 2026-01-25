import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Users, Check, Building2, Loader2, FileText, Pencil, ArrowLeft, Plane, Car, Smartphone } from 'lucide-react';
import { BenefitTypeBadge, BenefitStatusBadge, EnrollmentsTable, EditBenefitPlanDialog, EnrollmentDetailsDialog, EditEnrollmentDialog } from '@/components/benefits';
import { useBenefitPlan, type AirTicketConfig, type CarParkConfig, type PhoneConfig } from '@/hooks/useBenefitPlans';
import { useBenefitEnrollments, type BenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

const BenefitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editPlanDialogOpen, setEditPlanDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<BenefitEnrollment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editEnrollmentDialogOpen, setEditEnrollmentDialogOpen] = useState(false);
  const { formatCurrency } = useCompanySettings();

  const { data: plan, isLoading: planLoading } = useBenefitPlan(id);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useBenefitEnrollments({ planId: id });

  const handleViewEnrollment = (enrollment: BenefitEnrollment) => {
    setSelectedEnrollment(enrollment);
    setDetailsDialogOpen(true);
  };

  const handleEditEnrollment = (enrollment: BenefitEnrollment) => {
    setSelectedEnrollment(enrollment);
    setDetailsDialogOpen(false);
    setEditEnrollmentDialogOpen(true);
  };

  const isLoading = planLoading || enrollmentsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/benefits')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Benefits
          </Button>
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Benefit plan not found</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const coverageLevels = plan.coverage_levels || [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title={plan.name}
          subtitle={plan.description || 'No description available'}
          breadcrumbs={[
            { label: 'Benefits', href: '/benefits' },
            { label: plan.name }
          ]}
          actions={
            <>
              <Button variant="outline" onClick={() => setEditPlanDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
              <Button onClick={() => navigate('/benefits/enroll')}>
                Enroll Employee
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 flex-wrap">
            <BenefitTypeBadge type={plan.type} />
            <BenefitStatusBadge status={plan.status} />
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {plan.provider}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {plan.enrolled_count} enrolled
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {plan.cost_frequency === 'yearly' ? 'Yearly Cost' : 'Monthly Cost'}
            </span>
          </div>
        </PageHeader>

        {/* Type-specific Configuration Display */}
        {plan.type === 'air_ticket' && plan.entitlement_config && (
          <Card className="border-border/50 border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-sky-700 dark:text-sky-400">
                <Plane className="h-5 w-5" />
                Air Ticket Entitlement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Tickets per Period</p>
                  <p className="text-2xl font-semibold">{(plan.entitlement_config as AirTicketConfig).tickets_per_period}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Period Duration</p>
                  <p className="text-2xl font-semibold">{(plan.entitlement_config as AirTicketConfig).period_years} year(s)</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Employees receive {(plan.entitlement_config as AirTicketConfig).tickets_per_period} air ticket(s) every {(plan.entitlement_config as AirTicketConfig).period_years} year(s). HR can mark tickets as used when claimed.
              </p>
            </CardContent>
          </Card>
        )}

        {plan.type === 'car_park' && (
          <Card className="border-border/50 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Car className="h-5 w-5" />
                Car Park Entitlement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monthly parking allocation with employee/employer cost sharing defined in coverage levels.
                Parking spot locations are assigned per-enrollment.
              </p>
            </CardContent>
          </Card>
        )}

        {plan.type === 'phone' && plan.entitlement_config && (
          <Card className="border-border/50 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-violet-700 dark:text-violet-400">
                <Smartphone className="h-5 w-5" />
                Phone Entitlement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Device Cost</p>
                  <p className="text-2xl font-semibold">{formatCurrency((plan.entitlement_config as PhoneConfig).total_device_cost)}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Installment</p>
                  <p className="text-2xl font-semibold">{formatCurrency((plan.entitlement_config as PhoneConfig).monthly_installment)}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Payment Duration</p>
                  <p className="text-2xl font-semibold">{(plan.entitlement_config as PhoneConfig).installment_months} months</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Phone benefit with payment tracking. Each employee's payment progress is tracked individually.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Coverage Levels */}
        {coverageLevels.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Coverage Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coverageLevels.map((coverage) => (
                  <div 
                    key={coverage.id} 
                    className="p-4 border rounded-lg bg-muted/20"
                  >
                    <h4 className="font-medium mb-3">{coverage.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employee Cost</span>
                        <span className="font-medium">{formatCurrency(coverage.employee_cost)}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employer Contribution</span>
                        <span className="text-emerald-600 font-medium">{formatCurrency(coverage.employer_cost)}/mo</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-semibold">{formatCurrency(coverage.employee_cost + coverage.employer_cost)}/mo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Plan Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Policy Document */}
        {plan.policy_document_url && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Policy Document</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a href={plan.policy_document_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  View Policy Document
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enrolled Employees */}
        {enrollments.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Enrolled Employees ({enrollments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EnrollmentsTable 
                enrollments={enrollments}
                onViewEnrollment={handleViewEnrollment}
              />
            </CardContent>
          </Card>
        )}

        {/* Plan Edit Dialog */}
        {plan && (
          <EditBenefitPlanDialog
            open={editPlanDialogOpen}
            onOpenChange={setEditPlanDialogOpen}
            plan={plan}
          />
        )}

        {/* Enrollment Details Dialog */}
        <EnrollmentDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          enrollment={selectedEnrollment}
          onEdit={handleEditEnrollment}
        />

        {/* Edit Enrollment Dialog */}
        <EditEnrollmentDialog
          open={editEnrollmentDialogOpen}
          onOpenChange={setEditEnrollmentDialogOpen}
          enrollment={selectedEnrollment}
        />
      </div>
    </DashboardLayout>
  );
};

export default BenefitDetail;
