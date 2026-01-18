import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Check, Building2, Loader2, FileText, Pencil } from 'lucide-react';
import { BenefitTypeBadge, BenefitStatusBadge, EnrollmentsTable, EditBenefitPlanDialog } from '@/components/benefits';
import { useBenefitPlan } from '@/hooks/useBenefitPlans';
import { useBenefitEnrollments } from '@/hooks/useBenefitEnrollments';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

const BenefitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { formatCurrency } = useCompanySettings();

  const { data: plan, isLoading: planLoading } = useBenefitPlan(id);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useBenefitEnrollments({ planId: id });

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
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/benefits')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Benefits
        </Button>

        {/* Plan Header */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BenefitTypeBadge type={plan.type} />
                  <BenefitStatusBadge status={plan.status} />
                </div>
                <h1 className="text-2xl font-semibold">{plan.name}</h1>
                <p className="text-muted-foreground">{plan.description || 'No description available'}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span>{plan.provider}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{plan.enrolled_count} enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Plan
                </Button>
                <Button onClick={() => navigate('/benefits/enroll')}>
                  Enroll Employee
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <EnrollmentsTable enrollments={enrollments} />
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        {plan && (
          <EditBenefitPlanDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            plan={plan}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BenefitDetail;
