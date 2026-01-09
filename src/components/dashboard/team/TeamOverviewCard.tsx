import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

interface TeamOverviewCardProps {
  teamMemberCount: number;
  isLoading?: boolean;
}

export function TeamOverviewCard({ teamMemberCount, isLoading }: TeamOverviewCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          My Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold">{teamMemberCount}</p>
            <p className="text-sm text-muted-foreground">
              Direct Report{teamMemberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
