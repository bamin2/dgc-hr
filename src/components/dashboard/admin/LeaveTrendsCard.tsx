import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaveTrendsData {
  thisMonth: number;
  lastMonth: number;
  percentChange: number;
}

interface LeaveTrendsCardProps {
  trends: LeaveTrendsData;
  isLoading?: boolean;
}

export function LeaveTrendsCard({ trends, isLoading }: LeaveTrendsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (trends.percentChange > 0) return TrendingUp;
    if (trends.percentChange < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trends.percentChange > 0) return 'text-red-500';
    if (trends.percentChange < 0) return 'text-emerald-500';
    return 'text-muted-foreground';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Leave Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{trends.thisMonth}</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
          
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="h-5 w-5" />
            <span className="text-lg font-semibold">
              {Math.abs(trends.percentChange)}%
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-medium text-muted-foreground">
              {trends.lastMonth}
            </p>
            <p className="text-sm text-muted-foreground">Last month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
