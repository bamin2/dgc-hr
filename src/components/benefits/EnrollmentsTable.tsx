import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { format } from 'date-fns';
import type { BenefitEnrollment } from '@/data/benefits';

interface EnrollmentsTableProps {
  enrollments: BenefitEnrollment[];
}

const coverageLevelLabels: Record<string, string> = {
  individual: 'Individual',
  individual_spouse: 'Employee + Spouse',
  individual_children: 'Employee + Children',
  family: 'Family'
};

export const EnrollmentsTable = ({ enrollments }: EnrollmentsTableProps) => {
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
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={enrollment.employee.avatar} />
                    <AvatarFallback>
                      {enrollment.employee.firstName[0]}{enrollment.employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{enrollment.employee.firstName} {enrollment.employee.lastName}</p>
                    <p className="text-xs text-muted-foreground">{enrollment.employee.department}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <BenefitTypeBadge type={enrollment.plan.type} showIcon={false} />
                  <span className="text-sm">{enrollment.plan.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {coverageLevelLabels[enrollment.coverageLevel] || enrollment.coverageLevel}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(enrollment.startDate), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="font-medium">
                ${enrollment.monthlyCost}/mo
              </TableCell>
              <TableCell>
                <BenefitStatusBadge status={enrollment.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
