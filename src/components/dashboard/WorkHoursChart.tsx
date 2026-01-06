import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useWeeklyWorkHours } from "@/hooks/useDashboardMetrics";

export function WorkHoursChart() {
  const { data: weeklyData, isLoading } = useWeeklyWorkHours();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const chartData = weeklyData?.data || [];
  const totalHours = weeklyData?.totalHours || 0;
  const overtime = weeklyData?.overtime || 0;
  const dailyAvg = weeklyData?.dailyAvg || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Total Work Hours
          </h3>
          <p className="text-sm text-muted-foreground">This week's overview</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">Hours Worked</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`${value}h`, "Hours"]}
            />
            <Bar
              dataKey="hours"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
          <p className="text-xs text-muted-foreground">Total Hours</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${overtime > 0 ? 'text-success' : 'text-muted-foreground'}`}>
            {overtime > 0 ? `+${overtime}h` : '0h'}
          </p>
          <p className="text-xs text-muted-foreground">Overtime</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{dailyAvg}h</p>
          <p className="text-xs text-muted-foreground">Daily Avg</p>
        </div>
      </div>
    </Card>
  );
}
