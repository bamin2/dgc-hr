import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { LeaveRequest } from '@/hooks/useLeaveRequests';
import { Check, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  showActions?: boolean;
}

export function LeaveRequestsTable({ requests, showActions = true }: LeaveRequestsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="text-center py-8 text-muted-foreground">
                No leave requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              const employee = request.employee;
              if (!employee) return null;

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={employee.avatar_url || undefined} 
                          alt={`${employee.first_name} ${employee.last_name}`} 
                        />
                        <AvatarFallback>
                          {employee.first_name[0]}{employee.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.department?.name || '-'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      {request.leave_type?.color && (
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: request.leave_type.color }}
                        />
                      )}
                      {request.leave_type?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      {new Date(request.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {request.start_date !== request.end_date && (
                        <>
                          {' - '}
                          {new Date(request.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {request.days_count} {request.days_count === 1 ? 'day' : 'days'}
                    {request.is_half_day && ' (Half)'}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {request.reason || '-'}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusBadge status={request.status} />
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => navigate(`/time-management/leave/${request.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
