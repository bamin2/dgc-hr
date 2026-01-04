import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { BenefitEnrollment } from '@/data/benefits';

interface BenefitsCostChartProps {
  enrollments: BenefitEnrollment[];
}

const COLORS = ['#22C55E', '#3B82F6', '#8B5CF6', '#F97316', '#14B8A6', '#64748B'];

export const BenefitsCostChart = ({ enrollments }: BenefitsCostChartProps) => {
  const costByType = enrollments.reduce((acc, enrollment) => {
    const type = enrollment.plan.type;
    acc[type] = (acc[type] || 0) + enrollment.monthlyCost;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels: Record<string, string> = {
    health: 'Health',
    dental: 'Dental',
    vision: 'Vision',
    '401k': '401(k)',
    life: 'Life',
    disability: 'Disability'
  };

  const data = Object.entries(costByType).map(([type, cost]) => ({
    name: typeLabels[type] || type,
    value: cost
  }));

  const totalCost = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Cost by Benefit Type</CardTitle>
        <p className="text-2xl font-semibold">${totalCost.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value}`, 'Monthly Cost']}
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
