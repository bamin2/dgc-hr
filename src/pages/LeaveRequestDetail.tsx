import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLeaveRequest } from '@/hooks/useLeaveRequests';
import { useRequestApprovalSteps } from '@/hooks/useApprovalSteps';
import { LeaveRequestDetailView } from '@/components/attendance/LeaveRequestDetailView';

export default function LeaveRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: request, isLoading, error } = useLeaveRequest(id || '');
  const { data: approvalSteps = [] } = useRequestApprovalSteps(id || '', 'time_off');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !request) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/attendance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Time Management
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Leave request not found or access denied.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const employeeName = request.employee 
    ? `${request.employee.first_name} ${request.employee.last_name}`
    : 'Unknown Employee';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Leave Request Details"
          subtitle={`${request.leave_type?.name || 'Leave'} - ${employeeName}`}
          breadcrumbs={[
            { label: 'Time Management', href: '/attendance' },
            { label: 'Leave Request Details' }
          ]}
        />

        <LeaveRequestDetailView request={request} approvalSteps={approvalSteps} />
      </div>
    </DashboardLayout>
  );
}
