import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { Eye, Users, Plane, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BenefitPlan, AirTicketConfig, PhoneConfig } from '@/hooks/useBenefitPlans';

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
            const costs = coverageLevels.map((c) => c.employee_cost + c.employer_cost);
            const minCost = costs.length > 0 ? Math.min(...costs) : 0;
            const maxCost = costs.length > 0 ? Math.max(...costs) : 0;

            const planCurrency = plan.currency || 'BHD';
            const formatPlanCurrency = (amount: number) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: planCurrency,
                minimumFractionDigits: 0,
              }).format(amount);

            // Render cost based on plan type
            const renderCost = () => {
              if (plan.type === 'air_ticket' && plan.entitlement_config) {
                const config = plan.entitlement_config as AirTicketConfig;
                return (
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                    <Plane className="h-3.5 w-3.5" />
                    {config.tickets_per_period} / {config.period_years}yr
                  </span>
                );
              }
              if (plan.type === 'phone' && plan.entitlement_config) {
                const config = plan.entitlement_config as PhoneConfig;
                return (
                  <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                    <Smartphone className="h-3.5 w-3.5" />
                    {formatPlanCurrency(config.monthly_installment)}/mo
                  </span>
                );
              }
              if (plan.type === 'car_park') {
                if (minCost === maxCost) {
                  return <>{formatPlanCurrency(minCost)}/mo</>;
                }
                return (
                  <>
                    {formatPlanCurrency(minCost)} - {formatPlanCurrency(maxCost)}/mo
                  </>
                );
              }
              // Standard insurance-type benefits
              if (minCost === maxCost) {
                return <>{formatPlanCurrency(minCost)}/mo</>;
              }
              return (
                <>
                  {formatPlanCurrency(minCost)} - {formatPlanCurrency(maxCost)}/mo
                </>
              );
            };

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
                <TableCell>{renderCost()}</TableCell>
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
