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
  currency?: string;
}

const chartConfig = {
  total: {
    label: "Total Payroll",
    color: "hsl(var(--primary))",
  },
};

export function PayrollChart({ data, currency = "USD" }: PayrollChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formattedData = data.map((item) => ({
    name: item.department,
    total: item.total,
    employees: item.count,
  }));

  // Dynamic height: minimum 250px, or 40px per department
  const chartHeight = Math.max(250, data.length * 40);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Payroll by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height: `${chartHeight}px` }}>
          <BarChart data={formattedData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [formatTooltipCurrency(Number(value)), "Total"]}
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
