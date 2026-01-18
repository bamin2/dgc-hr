import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BenefitTypeBadge } from './BenefitTypeBadge';
import { BenefitStatusBadge } from './BenefitStatusBadge';
import { Users, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BenefitPlan } from '@/hooks/useBenefitPlans';

interface BenefitPlanCardProps {
  plan: BenefitPlan;
}

export const BenefitPlanCard = ({ plan }: BenefitPlanCardProps) => {
  const navigate = useNavigate();
  const coverageLevels = plan.coverage_levels || [];
  const costs = coverageLevels.map(c => c.employee_cost);
  const lowestCost = costs.length > 0 ? Math.min(...costs) : 0;

  // Format currency using the plan's currency
  const planCurrency = plan.currency || 'BHD';
  const formatPlanCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: planCurrency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-border/50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <BenefitTypeBadge type={plan.type} />
            <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
          </div>
          <BenefitStatusBadge status={plan.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plan.description || 'No description available'}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{plan.enrolled_count} enrolled</span>
          </div>
          <div className="text-muted-foreground">
            From <span className="font-semibold text-foreground">{formatPlanCurrency(lowestCost)}</span>/mo
          </div>
        </div>

        {plan.features && plan.features.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Features</p>
            <ul className="space-y-1.5">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full group"
          onClick={() => navigate(`/benefits/plans/${plan.id}`)}
        >
          View Details
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};
