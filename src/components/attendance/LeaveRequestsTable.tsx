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
import { LeaveRequest, getLeaveTypeLabel } from '@/data/attendance';
import { mockEmployees as employees } from '@/data/employees';
import { Check, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  showActions?: boolean;
}

export function LeaveRequestsTable({ requests, showActions = true }: LeaveRequestsTableProps) {
  const navigate = useNavigate();
  
  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId);
  };

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
              const employee = getEmployee(request.employeeId);
              if (!employee) return null;

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                        <AvatarFallback>
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{employee.firstName} {employee.lastName}</p>
                        <p className="text-xs text-muted-foreground">{employee.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getLeaveTypeLabel(request.leaveType)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      {new Date(request.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {request.startDate !== request.endDate && (
                        <>
                          {' - '}
                          {new Date(request.endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                    {request.isHalfDay && ' (Half)'}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusBadge status={request.status} />
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/attendance/leave/${request.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
