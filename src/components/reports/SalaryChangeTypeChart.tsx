import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { ChangeTypeBreakdown } from '@/hooks/useSalaryAnalytics';

interface SalaryChangeTypeChartProps {
  data: ChangeTypeBreakdown[];
  isLoading?: boolean;
}

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const chartConfig = {
  count: {
    label: 'Count',
  },
};

export function SalaryChangeTypeChart({ data, isLoading }: SalaryChangeTypeChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));

  const totalChanges = data.reduce((sum, item) => sum + item.count, 0);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Change Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Change Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No salary changes recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Change Types Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex">
          <ChartContainer config={chartConfig} className="flex-1">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <span>
                        {value} changes ({((Number(value) / totalChanges) * 100).toFixed(1)}%)
                      </span>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-col justify-center gap-2 min-w-[140px]">
            {chartData.map((item, index) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
