import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText } from 'lucide-react';
import {
  BenefitsMetrics,
  BenefitPlanCard,
  BenefitsFilters,
  BenefitsTable,
  EnrollmentsTable,
  ClaimsTable,
  BenefitsCostChart
} from '@/components/benefits';
import {
  benefitPlans,
  benefitEnrollments,
  benefitClaims,
  getBenefitsMetrics,
  type BenefitType,
  type BenefitStatus,
  type ClaimStatus
} from '@/data/benefits';
import { useToast } from '@/hooks/use-toast';

const Benefits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<BenefitType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BenefitStatus | 'all'>('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | 'all'>('all');

  const metrics = getBenefitsMetrics();

  // Filter plans
  const filteredPlans = benefitPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || plan.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter enrollments
  const filteredEnrollments = benefitEnrollments.filter(enrollment => {
    const employeeName = `${enrollment.employee.firstName} ${enrollment.employee.lastName}`;
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.plan.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || enrollment.plan.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Filter claims
  const filteredClaims = benefitClaims.filter(claim => {
    const employeeName = `${claim.employee.firstName} ${claim.employee.lastName}`;
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || claim.plan.type === typeFilter;
    const matchesStatus = claimStatusFilter === 'all' || claim.status === claimStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApproveClaim = (claimId: string) => {
    toast({
      title: 'Claim Approved',
      description: `Claim ${claimId} has been approved successfully.`
    });
  };

  const handleDenyClaim = (claimId: string) => {
    toast({
      title: 'Claim Denied',
      description: `Claim ${claimId} has been denied.`,
      variant: 'destructive'
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Benefits</h1>
              <p className="text-muted-foreground">Manage employee benefits and enrollments</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/benefits/claims/new')}>
                <FileText className="mr-2 h-4 w-4" />
                Submit Claim
              </Button>
              <Button onClick={() => navigate('/benefits/enroll')}>
                <Plus className="mr-2 h-4 w-4" />
                New Enrollment
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <BenefitsMetrics metrics={metrics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-base font-medium">Available Plans</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('plans')}>
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {benefitPlans.slice(0, 4).map(plan => (
                          <BenefitPlanCard key={plan.id} plan={plan} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <BenefitsCostChart enrollments={benefitEnrollments.filter(e => e.status === 'active')} />
                  
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Pending Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {benefitClaims.filter(c => c.status === 'pending').slice(0, 3).map(claim => (
                          <div key={claim.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{claim.employee.firstName} {claim.employee.lastName}</p>
                              <p className="text-xs text-muted-foreground">{claim.claimType}</p>
                            </div>
                            <p className="font-semibold">${claim.amount}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6 mt-6">
              <BenefitsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                showStatusFilter
              />
              <BenefitsTable plans={filteredPlans} />
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments" className="space-y-6 mt-6">
              <BenefitsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
              />
              <EnrollmentsTable enrollments={filteredEnrollments} />
            </TabsContent>

            {/* Claims Tab */}
            <TabsContent value="claims" className="space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <BenefitsFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    typeFilter={typeFilter}
                    onTypeChange={setTypeFilter}
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md bg-background text-sm"
                  value={claimStatusFilter}
                  onChange={(e) => setClaimStatusFilter(e.target.value as ClaimStatus | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
              <ClaimsTable 
                claims={filteredClaims} 
                onApprove={handleApproveClaim}
                onDeny={handleDenyClaim}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Benefits;
