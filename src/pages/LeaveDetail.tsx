import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, User, FileText, Check, X } from 'lucide-react';
import { LeaveStatusBadge } from '@/components/attendance';
import { leaveRequests, getLeaveTypeLabel } from '@/data/attendance';
import { mockEmployees as employees } from '@/data/employees';
import { useToast } from '@/hooks/use-toast';

export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const request = leaveRequests.find((r) => r.id === id);
  const employee = request ? employees.find((e) => e.id === request.employeeId) : null;

  if (!request || !employee) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Leave Request Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The leave request you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate('/attendance')}>Back to Attendance</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    toast({
      title: 'Leave Approved',
      description: `Leave request for ${employee.firstName} ${employee.lastName} has been approved.`,
    });
    navigate('/attendance');
  };

  const handleReject = () => {
    toast({
      title: 'Leave Rejected',
      description: `Leave request for ${employee.firstName} ${employee.lastName} has been rejected.`,
      variant: 'destructive',
    });
    navigate('/attendance');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => navigate('/attendance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </Button>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Leave Request Details</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and manage leave request
              </p>
            </div>
            <LeaveStatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Employee Info */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                      <AvatarFallback>
                        {employee.firstName[0]}{employee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Details */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Leave Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Leave Type</p>
                        <p className="font-medium">{getLeaveTypeLabel(request.leaveType)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                          {request.isHalfDay && ' (Half Day)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">
                          {new Date(request.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {new Date(request.endDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Reason</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>

                  {request.status === 'approved' && request.approvedBy && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Approved By</p>
                          <p className="font-medium">{request.approvedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            on {new Date(request.approvedDate!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Rejection Reason</p>
                        <p className="text-sm text-red-600">{request.rejectionReason}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              {request.status === 'pending' && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Add a comment (optional)</p>
                      <Textarea placeholder="Add any notes or comments..." rows={3} />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleReject}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Request Timeline */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium">Request Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {request.status === 'approved' && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium">Request Approved</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.approvedDate!).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium">Request Rejected</p>
                          <p className="text-xs text-muted-foreground">
                            Reason: {request.rejectionReason}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.status === 'pending' && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium">Awaiting Approval</p>
                          <p className="text-xs text-muted-foreground">Pending review</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
