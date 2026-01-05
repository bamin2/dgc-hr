import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { DepartmentSalary } from '@/hooks/useSalaryAnalytics';

interface DepartmentSalaryTableProps {
  data: DepartmentSalary[];
  isLoading?: boolean;
}

export function DepartmentSalaryTable({ data, isLoading }: DepartmentSalaryTableProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Department Salary Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Department Salary Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No department data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Department Salary Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Headcount</TableHead>
              <TableHead className="text-right">Total Payroll</TableHead>
              <TableHead className="text-right">Avg Salary</TableHead>
              <TableHead className="text-right">Range</TableHead>
              <TableHead className="w-[140px]">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dept) => (
              <TableRow key={dept.departmentId}>
                <TableCell className="font-medium">{dept.department}</TableCell>
                <TableCell className="text-right">{dept.headcount}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(dept.totalPayroll)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(dept.avgSalary)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatCurrency(dept.minSalary)} - {formatCurrency(dept.maxSalary)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={dept.percentOfTotal} className="h-2" />
                    <span className="text-xs text-muted-foreground w-10">
                      {dept.percentOfTotal.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
