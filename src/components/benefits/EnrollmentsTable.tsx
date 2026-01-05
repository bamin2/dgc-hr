import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { format } from 'date-fns';
import type { BenefitEnrollment } from '@/hooks/useBenefitEnrollments';

interface EnrollmentsTableProps {
  enrollments: BenefitEnrollment[];
}

export const EnrollmentsTable = ({ enrollments }: EnrollmentsTableProps) => {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const employee = enrollment.employee;
            const plan = enrollment.plan;
            const coverageLevel = enrollment.coverage_level;
            const monthlyCost = enrollment.employee_contribution + enrollment.employer_contribution;

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
                  ${monthlyCost}/mo
                </TableCell>
                <TableCell>
                  <BenefitStatusBadge status={enrollment.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
