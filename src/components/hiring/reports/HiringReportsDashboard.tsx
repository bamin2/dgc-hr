import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHiringMetrics, useOffersByStatus } from "@/hooks/useHiringReports";
import { Users, FileText, CheckCircle, XCircle, TrendingUp, Clock } from "lucide-react";

export function HiringReportsDashboard() {
  const { data: metrics, isLoading } = useHiringMetrics();
  const { data: offersByStatus } = useOffersByStatus();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading reports...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics?.totalCandidates || 0}</div>
            <p className="text-xs text-muted-foreground">{metrics?.candidatesInPipeline || 0} in pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics?.offersSent || 0}</div>
            <p className="text-xs text-muted-foreground">{metrics?.offersWithNegotiation || 0} with negotiations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics?.acceptanceRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">{metrics?.offersAccepted || 0} accepted, {metrics?.offersRejected || 0} rejected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days to Accept</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics?.averageDaysToAccept?.toFixed(1) || "-"}</div>
            <p className="text-xs text-muted-foreground">From sent to accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Offers by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Offers by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {offersByStatus?.map((item) => (
              <div key={item.status} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                <span className="capitalize font-medium">{item.status}</span>
                <span className="text-2xl font-semibold">{item.count}</span>
              </div>
            ))}
            {(!offersByStatus || offersByStatus.length === 0) && (
              <p className="text-muted-foreground">No offers yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
