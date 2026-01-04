import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DepartmentStats } from '@/data/reports';

interface DepartmentTableProps {
  data: DepartmentStats[];
}

export const DepartmentTable = ({ data }: DepartmentTableProps) => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Department Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Key metrics by department</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Headcount</TableHead>
              <TableHead>Avg Salary</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-center">Leave Balance</TableHead>
              <TableHead>Turnover</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dept) => (
              <TableRow key={dept.department} className="hover:bg-muted/30">
                <TableCell className="font-medium">{dept.department}</TableCell>
                <TableCell className="text-center">{dept.headcount}</TableCell>
                <TableCell>${dept.avgSalary.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={dept.attendanceRate} 
                      className="h-2 w-16"
                    />
                    <span className="text-sm text-muted-foreground">{dept.attendanceRate}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{dept.leaveBalance} days</TableCell>
                <TableCell>
                  <span className={dept.turnoverRate > 10 ? 'text-red-600' : 'text-emerald-600'}>
                    {dept.turnoverRate}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
