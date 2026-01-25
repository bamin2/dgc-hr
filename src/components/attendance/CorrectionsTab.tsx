import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceCorrectionsTable } from './AttendanceCorrectionsTable';
import {
  useAttendanceCorrections,
  usePendingManagerApprovals,
  usePendingHRApprovals,
} from '@/hooks/useAttendanceCorrections';
import { useRole } from '@/contexts/RoleContext';

export function CorrectionsTab() {
  const { hasRole, isManager, canEditEmployees } = useRole();
  const [activeSubTab, setActiveSubTab] = useState('all');

  const { data: allCorrections, isLoading: allLoading } = useAttendanceCorrections();
  const { data: pendingManager, isLoading: managerLoading } = usePendingManagerApprovals();
  const { data: pendingHR, isLoading: hrLoading } = usePendingHRApprovals();

  const isHROrAdmin = hasRole('hr') || hasRole('admin');
  const canReviewAsManager = isManager && !isHROrAdmin;

  // Filter corrections for managers - only show their team's requests
  const managerPendingCount = pendingManager?.length || 0;
  const hrPendingCount = pendingHR?.length || 0;

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="all">All Corrections</TabsTrigger>
          {(canReviewAsManager || isHROrAdmin) && (
            <TabsTrigger value="pending-manager">
              Pending Manager
              {managerPendingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs rounded-full">
                  {managerPendingCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
          {isHROrAdmin && (
            <TabsTrigger value="pending-hr">
              Pending HR
              {hrPendingCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs rounded-full">
                  {hrPendingCount}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {allLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <AttendanceCorrectionsTable corrections={allCorrections || []} />
          )}
        </TabsContent>

        {(canReviewAsManager || isHROrAdmin) && (
          <TabsContent value="pending-manager" className="mt-4">
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Manager Approval Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and approve/reject correction requests from your team
                </p>
              </CardHeader>
            </Card>
            {managerLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <AttendanceCorrectionsTable
                corrections={pendingManager || []}
                showReviewActions
                reviewerType="manager"
              />
            )}
          </TabsContent>
        )}

        {isHROrAdmin && (
          <TabsContent value="pending-hr" className="mt-4">
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">HR Approval Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Final review - approved corrections will be applied immediately
                </p>
              </CardHeader>
            </Card>
            {hrLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <AttendanceCorrectionsTable
                corrections={pendingHR || []}
                showReviewActions
                reviewerType="hr"
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
