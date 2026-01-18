import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, CalendarX } from 'lucide-react';
import type { BenefitEnrollment } from '@/hooks/useBenefitEnrollments';

interface EnrollmentsTableProps {
  enrollments: BenefitEnrollment[];
  onViewEnrollment?: (enrollment: BenefitEnrollment) => void;
  onEndEnrollment?: (enrollment: BenefitEnrollment) => void;
}

export const EnrollmentsTable = ({ 
  enrollments,
  onViewEnrollment,
  onEndEnrollment,
}: EnrollmentsTableProps) => {
  if (enrollments.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No enrollments found.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Employee</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Coverage</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Monthly Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const employee = enrollment.employee;
            const plan = enrollment.plan;
            const coverageLevel = enrollment.coverage_level;
            const monthlyCost = enrollment.employee_contribution + enrollment.employer_contribution;

            // Format using plan's currency
            const planCurrency = plan?.currency || 'BHD';
            const formatPlanCurrency = (amount: number) => {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: planCurrency,
                minimumFractionDigits: 0,
              }).format(amount);
            };

            return (
              <TableRow key={enrollment.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee?.avatar_url || undefined} />
                      <AvatarFallback>
                        {employee?.first_name?.[0] || ''}{employee?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {employee?.first_name} {employee?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee?.department?.name || 'No department'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {plan?.type && <BenefitTypeBadge type={plan.type as any} showIcon={false} />}
                    <span className="text-sm">{plan?.name || 'Unknown plan'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {coverageLevel?.name || 'Standard'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(enrollment.start_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPlanCurrency(monthlyCost)}/mo
                </TableCell>
                <TableCell>
                  <BenefitStatusBadge status={enrollment.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewEnrollment?.(enrollment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {enrollment.status === 'active' && (
                        <DropdownMenuItem
                          onClick={() => onEndEnrollment?.(enrollment)}
                          className="text-destructive focus:text-destructive"
                        >
                          <CalendarX className="mr-2 h-4 w-4" />
                          End Enrollment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
