import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Calendar,
  Inbox,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useBenefitEnrollments, BenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { BenefitTypeBadge } from '@/components/benefits/BenefitTypeBadge';
import { format } from 'date-fns';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { BenefitType } from '@/types/benefits';

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
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const activeEnrollments = enrollments?.filter(e => e.status === 'active') || [];
  const pendingEnrollments = enrollments?.filter(e => e.status === 'pending') || [];
  const otherEnrollments = enrollments?.filter(e => ['cancelled', 'expired'].includes(e.status)) || [];

  // Find the next renewal date (earliest end_date among active enrollments)
  const nextRenewal = activeEnrollments
    .filter(e => e.end_date)
    .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {(activeEnrollments.length > 0 || pendingEnrollments.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Plans</p>
                <p className="text-xl font-semibold">{activeEnrollments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Enrollments */}
      {activeEnrollments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Benefits</h3>
          {activeEnrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}

      {/* Pending Enrollments */}
      {pendingEnrollments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Enrollments</h3>
          {pendingEnrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}

      {/* Past Enrollments */}
      {otherEnrollments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Past Enrollments</h3>
          {otherEnrollments.slice(0, 5).map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {(!enrollments || enrollments.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Benefits Enrolled
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              You are not currently enrolled in any benefit plans.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
