import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Palmtree, Stethoscope, User } from 'lucide-react';

interface LeaveBalanceCardProps {
  balance: {
    annual: { total: number; used: number; remaining: number };
    sick: { total: number; used: number; remaining: number };
    personal: { total: number; used: number; remaining: number };
  };
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const leaveTypes = [
    {
      name: 'Annual Leave',
      icon: Palmtree,
      data: balance.annual,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Sick Leave',
      icon: Stethoscope,
      data: balance.sick,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      name: 'Personal Leave',
      icon: User,
      data: balance.personal,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leaveTypes.map((leave) => {
          const percentage = (leave.data.used / leave.data.total) * 100;
          
          return (
            <div key={leave.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${leave.bgColor}`}>
                    <leave.icon className={`h-3.5 w-3.5 ${leave.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium">{leave.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {leave.data.remaining} / {leave.data.total} days
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
