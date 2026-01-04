import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Check, Building2, Calendar } from 'lucide-react';
import { BenefitTypeBadge, BenefitStatusBadge, EnrollmentsTable } from '@/components/benefits';
import { benefitPlans, benefitEnrollments } from '@/data/benefits';

const coverageLevelLabels: Record<string, string> = {
  individual: 'Individual',
  individual_spouse: 'Employee + Spouse',
  individual_children: 'Employee + Children',
  family: 'Family'
};

const BenefitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const plan = benefitPlans.find(p => p.id === id);
  const planEnrollments = benefitEnrollments.filter(e => e.planId === id);

  if (!plan) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
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
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
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
                  <p className="text-muted-foreground">{plan.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      <span>{plan.provider}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{plan.enrolledCount} enrolled</span>
                    </div>
                    {plan.enrollmentDeadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(plan.enrollmentDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={() => navigate('/benefits/enroll')}>
                  Enroll Employee
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Levels */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Coverage Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.coverageLevels.map((coverage) => (
                  <div 
                    key={coverage.level} 
                    className="p-4 border rounded-lg bg-muted/20"
                  >
                    <h4 className="font-medium mb-3">{coverageLevelLabels[coverage.level]}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employee Cost</span>
                        <span className="font-medium">${coverage.employeeCost}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employer Contribution</span>
                        <span className="text-emerald-600 font-medium">${coverage.employerCost}/mo</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-semibold">${coverage.employeeCost + coverage.employerCost}/mo</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
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

          {/* Enrolled Employees */}
          {planEnrollments.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Enrolled Employees ({planEnrollments.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <EnrollmentsTable enrollments={planEnrollments} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default BenefitDetail;
