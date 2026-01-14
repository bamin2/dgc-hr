import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useAllBusinessTrips } from '@/hooks/useBusinessTrips';
import { TRIP_STATUS_LABELS } from '@/types/businessTrips';

export function TripReportsTab() {
  const { data: allTrips = [] } = useAllBusinessTrips({});

  const handleExportSummary = () => {
    if (!allTrips?.length) return;
    
    const headers = [
      'Employee', 'Department', 'Destination', 'Start Date', 'End Date', 
      'Nights', 'Per Diem Budget (BHD)', 'Per Diem Payable (BHD)', 
      'Corporate Card', 'Status'
    ];
    
    const rows = allTrips.map(trip => [
      `${trip.employee?.first_name} ${trip.employee?.last_name}`,
      '', // Department - would need to join
      trip.destination?.name || '',
      trip.start_date,
      trip.end_date,
      trip.nights_count,
      trip.per_diem_budget_bhd.toFixed(3),
      trip.per_diem_payable_bhd.toFixed(3),
      trip.corporate_card_used ? 'Yes' : 'No',
      TRIP_STATUS_LABELS[trip.status],
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadCSV(csvContent, 'trips-summary-report');
  };

  const handleExportPendingReconciliation = () => {
    if (!allTrips?.length) return;
    
    const pendingTrips = allTrips.filter(t => 
      t.status === 'hr_approved' || t.status === 'completed'
    );
    
    const headers = [
      'Employee', 'Destination', 'End Date', 'Per Diem Budget (BHD)', 
      'Status', 'Days Since End'
    ];
    
    const today = new Date();
    const rows = pendingTrips.map(trip => {
      const endDate = new Date(trip.end_date);
      const daysSinceEnd = Math.floor((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      return [
        `${trip.employee?.first_name} ${trip.employee?.last_name}`,
        trip.destination?.name || '',
        trip.end_date,
        trip.per_diem_budget_bhd.toFixed(3),
        TRIP_STATUS_LABELS[trip.status],
        daysSinceEnd > 0 ? daysSinceEnd : 0,
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadCSV(csvContent, 'pending-reconciliation-report');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const totalTrips = allTrips?.length || 0;
  const totalBudget = allTrips?.reduce((sum, t) => sum + t.per_diem_budget_bhd, 0) || 0;
  const totalPayable = allTrips?.reduce((sum, t) => sum + t.per_diem_payable_bhd, 0) || 0;
  const pendingReconciliation = allTrips?.filter(t => 
    t.status === 'hr_approved' || t.status === 'completed'
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Trips</CardDescription>
            <CardTitle className="text-2xl">{totalTrips}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Budget</CardDescription>
            <CardTitle className="text-2xl">BHD {totalBudget.toFixed(3)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payable</CardDescription>
            <CardTitle className="text-2xl">BHD {totalPayable.toFixed(3)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Reconciliation</CardDescription>
            <CardTitle className="text-2xl">{pendingReconciliation}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Report Downloads */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Trips Summary Report
            </CardTitle>
            <CardDescription>
              Complete list of all business trips with employee, destination, dates, and amounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportSummary} disabled={!allTrips?.length}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Pending Reconciliation
            </CardTitle>
            <CardDescription>
              Trips that are approved or completed but not yet reconciled/closed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportPendingReconciliation} disabled={!allTrips?.length}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Budget vs Expenses
            </CardTitle>
            <CardDescription>
              Compare per diem budget against actual reimbursable expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
