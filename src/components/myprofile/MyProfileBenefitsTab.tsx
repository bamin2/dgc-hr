import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Calendar,
  Inbox,
  Users,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ExternalLink,
  Download
} from 'lucide-react';
import { useBenefitEnrollments, BenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { BenefitTypeBadge } from '@/components/benefits/BenefitTypeBadge';
import { InsuranceCardExpiryBadge } from '@/components/benefits/InsuranceCardExpiryBadge';
import { format } from 'date-fns';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { BenefitType } from '@/types/benefits';
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';

const HEALTH_PLAN_TYPES = ['health', 'dental', 'vision', 'life', 'disability'];

const handleDownload = async (url: string, fileName: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

interface MyProfileBenefitsTabProps {
  employeeId: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  pending: { label: 'Pending', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
};

function EnrollmentCard({ enrollment }: { enrollment: BenefitEnrollment }) {
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  const config = statusConfig[enrollment.status] || statusConfig.pending;
  const beneficiaries = enrollment.beneficiaries || [];
  const hasBeneficiaries = beneficiaries.length > 0;
  
  const isHealthPlan = HEALTH_PLAN_TYPES.includes(enrollment.plan?.type || '');
  const hasAnyInsuranceCard = 
    enrollment.insurance_card_url || 
    beneficiaries.some(b => b.insurance_card_url);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{enrollment.plan?.name}</p>
                <BenefitTypeBadge 
                  type={enrollment.plan?.type as BenefitType} 
                  showIcon={false} 
                  className="text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {enrollment.plan?.provider}
              </p>
            </div>
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Coverage Level</p>
              <p className="text-sm font-medium">{enrollment.coverage_level?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium">
                {format(new Date(enrollment.start_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Beneficiaries */}
          {hasBeneficiaries && (
            <Collapsible open={showBeneficiaries} onOpenChange={setShowBeneficiaries}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {beneficiaries.length} Beneficiar{beneficiaries.length === 1 ? 'y' : 'ies'}
                  </span>
                  {showBeneficiaries ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-2 border-t pt-2">
                  {beneficiaries.map((beneficiary) => (
                    <div key={beneficiary.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{beneficiary.name}</p>
                        <p className="text-xs text-muted-foreground">{beneficiary.relationship}</p>
                      </div>
                      {beneficiary.percentage && (
                        <span className="text-muted-foreground">{beneficiary.percentage}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Insurance Cards Section - Only for health-related plans */}
          {isHealthPlan && hasAnyInsuranceCard && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5" />
                Insurance Cards
              </h4>
              
              {/* Employee's Card */}
              {enrollment.insurance_card_url && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">My Card</span>
                    <InsuranceCardExpiryBadge expiryDate={enrollment.insurance_card_expiry_date} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => window.open(enrollment.insurance_card_url!, '_blank')}
                      title="View"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDownload(enrollment.insurance_card_url!, 'my-insurance-card')}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Dependent Cards */}
              {beneficiaries.filter(b => b.insurance_card_url).map((beneficiary) => (
                <div key={beneficiary.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{beneficiary.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({beneficiary.relationship})</span>
                    <InsuranceCardExpiryBadge expiryDate={beneficiary.insurance_card_expiry_date} />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => window.open(beneficiary.insurance_card_url!, '_blank')}
                      title="View"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDownload(beneficiary.insurance_card_url!, `${beneficiary.name}-insurance-card`)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MyProfileBenefitsTab({ employeeId }: MyProfileBenefitsTabProps) {
  const { data: enrollments, isLoading } = useBenefitEnrollments({
    employeeId: employeeId,
  });

  if (isLoading) {
    return (
      <BentoGrid noPadding>
        <BentoCard colSpan={6}><Skeleton className="h-24 w-full" /></BentoCard>
        <BentoCard colSpan={6}><Skeleton className="h-24 w-full" /></BentoCard>
        <BentoCard colSpan={12}><Skeleton className="h-48 w-full" /></BentoCard>
      </BentoGrid>
    );
  }

  const activeEnrollments = enrollments?.filter(e => e.status === 'active') || [];
  const pendingEnrollments = enrollments?.filter(e => e.status === 'pending') || [];
  const otherEnrollments = enrollments?.filter(e => ['cancelled', 'expired'].includes(e.status)) || [];

  // Find the next renewal date (earliest end_date among active enrollments)
  const nextRenewal = activeEnrollments
    .filter(e => e.end_date)
    .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())[0];

  const hasAnyEnrollments = enrollments && enrollments.length > 0;

  return (
    <BentoGrid noPadding>
      {/* Summary Cards */}
      {hasAnyEnrollments && (
        <>
          <BentoCard colSpan={6}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Plans</p>
                <p className="text-xl font-semibold">{activeEnrollments.length}</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard colSpan={6}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Renewal</p>
                <p className="text-xl font-semibold">
                  {nextRenewal?.end_date 
                    ? format(new Date(nextRenewal.end_date), 'MMM yyyy')
                    : '—'
                  }
                </p>
              </div>
            </div>
          </BentoCard>
        </>
      )}

      {/* Active Enrollments */}
      {activeEnrollments.length > 0 && (
        <BentoCard colSpan={12}>
          <CardTitle className="text-sm font-medium text-muted-foreground mb-4">Active Benefits</CardTitle>
          <div className="space-y-4">
            {activeEnrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </BentoCard>
      )}

      {/* Pending Enrollments */}
      {pendingEnrollments.length > 0 && (
        <BentoCard colSpan={6}>
          <CardTitle className="text-sm font-medium text-muted-foreground mb-4">Pending Enrollments</CardTitle>
          <div className="space-y-4">
            {pendingEnrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </BentoCard>
      )}

      {/* Past Enrollments */}
      {otherEnrollments.length > 0 && (
        <BentoCard colSpan={pendingEnrollments.length > 0 ? 6 : 12}>
          <CardTitle className="text-sm font-medium text-muted-foreground mb-4">Past Enrollments</CardTitle>
          <div className="space-y-4">
            {otherEnrollments.slice(0, 5).map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </BentoCard>
      )}

      {/* Empty State */}
      {!hasAnyEnrollments && (
        <BentoCard colSpan={12}>
          <div className="p-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Benefits Enrolled
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              You are not currently enrolled in any benefit plans.
            </p>
          </div>
        </BentoCard>
      )}
    </BentoGrid>
  );
}
