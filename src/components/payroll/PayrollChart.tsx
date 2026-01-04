import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface DepartmentData {
  department: string;
  total: number;
  count: number;
}

interface PayrollChartProps {
  data: DepartmentData[];
}

const chartConfig = {
  total: {
    label: "Total Payroll",
    color: "hsl(var(--primary))",
  },
};

export function PayrollChart({ data }: PayrollChartProps) {
  const formattedData = data.map((item) => ({
    name: item.department,
    total: item.total,
    employees: item.count,
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Payroll by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={formattedData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={90} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Total"]}
                />
              }
            />
            <Bar 
              dataKey="total" 
              fill="hsl(var(--primary))" 
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
