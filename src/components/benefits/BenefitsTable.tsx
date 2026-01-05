import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BenefitPlan } from '@/hooks/useBenefitPlans';

interface BenefitsTableProps {
  plans: BenefitPlan[];
}

export const BenefitsTable = ({ plans }: BenefitsTableProps) => {
  const navigate = useNavigate();

  if (plans.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No benefit plans found. Create a plan to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Plan Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="text-center">Enrolled</TableHead>
            <TableHead>Cost Range</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => {
            const coverageLevels = plan.coverage_levels || [];
            const costs = coverageLevels.map(c => c.employee_cost);
            const minCost = costs.length > 0 ? Math.min(...costs) : 0;
            const maxCost = costs.length > 0 ? Math.max(...costs) : 0;
            
            return (
              <TableRow key={plan.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  <BenefitTypeBadge type={plan.type} />
                </TableCell>
                <TableCell className="text-muted-foreground">{plan.provider}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.enrolled_count}</span>
                  </div>
                </TableCell>
                <TableCell>
                  ${minCost} - ${maxCost}/mo
                </TableCell>
                <TableCell>
                  <BenefitStatusBadge status={plan.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/benefits/plans/${plan.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
