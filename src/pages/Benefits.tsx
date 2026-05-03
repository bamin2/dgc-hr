import { useState } from 'react';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2 } from 'lucide-react';
import {
  BenefitsMetrics,
  BenefitPlanCard,
  BenefitsFilters,
  BenefitsTable,
  EnrollmentsTable,
  ClaimsTable,
  BenefitsCostChart,
  CreateBenefitPlanDialog,
  EnrollmentDetailsDialog,
  EndEnrollmentDialog,
  EditEnrollmentDialog,
} from '@/components/benefits';
import { useBenefitPlans, type BenefitType, type BenefitStatus } from '@/hooks/useBenefitPlans';
import { useBenefitEnrollments, type EnrollmentStatus, type BenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { useBenefitClaims, useApproveBenefitClaim, useRejectBenefitClaim, type ClaimStatus } from '@/hooks/useBenefitClaims';
import { useBenefitsMetrics } from '@/hooks/useBenefitsMetrics';
import { useToast } from '@/hooks/use-toast';

const Benefits = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { formatCurrency } = useCompanySettings();
  
  // Initialize activeTab from URL param or default to 'overview'
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  
  // Enrollment dialogs state
  const [selectedEnrollment, setSelectedEnrollment] = useState<BenefitEnrollment | null>(null);
  const [enrollmentDetailsOpen, setEnrollmentDetailsOpen] = useState(false);
  const [endEnrollmentOpen, setEndEnrollmentOpen] = useState(false);
  const [editEnrollmentOpen, setEditEnrollmentOpen] = useState(false);

  // Handle edit enrollment
  const handleEditEnrollment = (enrollment: BenefitEnrollment) => {
    setEnrollmentDetailsOpen(false);
    setSelectedEnrollment(enrollment);
    setEditEnrollmentOpen(true);
  };
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<BenefitType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BenefitStatus | 'all'>('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | 'all'>('all');

  // Data fetching
  const { data: plans = [], isLoading: plansLoading } = useBenefitPlans();
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useBenefitEnrollments();
  const { data: claims = [], isLoading: claimsLoading } = useBenefitClaims();
  const { data: metrics, isLoading: metricsLoading } = useBenefitsMetrics();

  // Mutations
  const approveClaim = useApproveBenefitClaim();
  const rejectClaim = useRejectBenefitClaim();

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || plan.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const employeeName = enrollment.employee 
      ? `${enrollment.employee.first_name} ${enrollment.employee.last_name}` 
      : '';
    const planName = enrollment.plan?.name || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || enrollment.plan?.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Filter claims
  const filteredClaims = claims.filter(claim => {
    const employeeName = claim.employee 
      ? `${claim.employee.first_name} ${claim.employee.last_name}` 
      : '';
    const description = claim.description || '';
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || claim.plan?.type === typeFilter;
    const matchesStatus = claimStatusFilter === 'all' || claim.status === claimStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Active enrollments for cost chart
  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  // Pending claims for overview
  const pendingClaims = claims.filter(c => c.status === 'pending').slice(0, 3);

  const handleApproveClaim = async (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    try {
      await approveClaim.mutateAsync({
        claimId,
        approvedAmount: claim.amount,
        reviewerId: claim.employee_id, // In real app, use current user's employee ID
      });
      toast({
        title: 'Claim Approved',
        description: `Claim has been approved successfully.`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve claim',
        variant: 'destructive'
      });
    }
  };

  const handleDenyClaim = async (claimId: string) => {
    try {
      await rejectClaim.mutateAsync({
        claimId,
        rejectionReason: 'Claim denied by administrator',
        reviewerId: claims.find(c => c.id === claimId)?.employee_id || '',
      });
      toast({
        title: 'Claim Denied',
        description: `Claim has been denied.`,
        variant: 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to deny claim',
        variant: 'destructive'
      });
    }
  };

  const isLoading = plansLoading || enrollmentsLoading || claimsLoading || metricsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Benefits"
          subtitle="Manage employee benefits and enrollments"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {metrics && <BenefitsMetrics metrics={metrics} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">Available Plans</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCreatePlanOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Plan
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('plans')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans.slice(0, 4).map(plan => (
                        <BenefitPlanCard key={plan.id} plan={plan} />
                      ))}
                      {plans.length === 0 && (
                        <p className="col-span-2 text-center text-muted-foreground py-8">
                          No benefit plans available. Add plans to get started.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <BenefitsCostChart enrollments={activeEnrollments} />
                
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Pending Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingClaims.map(claim => (
                        <div key={claim.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">
                              {claim.employee?.first_name} {claim.employee?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{claim.description || 'Benefit claim'}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(claim.amount)}</p>
                        </div>
                      ))}
                      {pendingClaims.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No pending claims
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <BenefitsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                showStatusFilter
              />
              <Button onClick={() => setCreatePlanOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </div>
            <BenefitsTable plans={filteredPlans} />
          </TabsContent>

          {/* Enrollments Tab */}
          <TabsContent value="enrollments" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <BenefitsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
              />
              <Button onClick={() => navigate('/benefits/enroll')}>
                <Plus className="mr-2 h-4 w-4" />
                New Enrollment
              </Button>
            </div>
            <EnrollmentsTable
              enrollments={filteredEnrollments}
              onViewEnrollment={(enrollment) => {
                setSelectedEnrollment(enrollment);
                setEnrollmentDetailsOpen(true);
              }}
              onEndEnrollment={(enrollment) => {
                setSelectedEnrollment(enrollment);
                setEndEnrollmentOpen(true);
              }}
            />
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <BenefitsFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  typeFilter={typeFilter}
                  onTypeChange={setTypeFilter}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border rounded-md bg-background text-sm"
                  value={claimStatusFilter}
                  onChange={(e) => setClaimStatusFilter(e.target.value as ClaimStatus | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button onClick={() => navigate('/benefits/claims/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Claim
                </Button>
              </div>
            </div>
            <ClaimsTable 
              claims={filteredClaims} 
              onApprove={handleApproveClaim}
              onDeny={handleDenyClaim}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateBenefitPlanDialog 
        open={createPlanOpen} 
        onOpenChange={setCreatePlanOpen}
      />

      <EnrollmentDetailsDialog
        open={enrollmentDetailsOpen}
        onOpenChange={setEnrollmentDetailsOpen}
        enrollment={selectedEnrollment}
        onEdit={handleEditEnrollment}
      />

      <EndEnrollmentDialog
        open={endEnrollmentOpen}
        onOpenChange={setEndEnrollmentOpen}
        enrollment={selectedEnrollment}
      />

      <EditEnrollmentDialog
        open={editEnrollmentOpen}
        onOpenChange={setEditEnrollmentOpen}
        enrollment={selectedEnrollment}
      />
    </DashboardLayout>
  );
};

export default Benefits;
