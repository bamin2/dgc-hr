import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", hours: 8.5, target: 8 },
  { day: "Tue", hours: 7.2, target: 8 },
  { day: "Wed", hours: 9.0, target: 8 },
  { day: "Thu", hours: 8.0, target: 8 },
  { day: "Fri", hours: 6.5, target: 8 },
  { day: "Sat", hours: 2.0, target: 0 },
  { day: "Sun", hours: 0, target: 0 },
];

export function WorkHoursChart() {
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
          <BarChart data={data} barCategoryGap="20%">
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
          <p className="text-2xl font-bold text-foreground">41.2h</p>
          <p className="text-xs text-muted-foreground">Total Hours</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">+3.2h</p>
          <p className="text-xs text-muted-foreground">Overtime</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">8.2h</p>
          <p className="text-xs text-muted-foreground">Daily Avg</p>
        </div>
      </div>
    </Card>
  );
}