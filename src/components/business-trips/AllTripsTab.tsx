import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAllBusinessTrips } from '@/hooks/useBusinessTrips';
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, TripStatus } from '@/types/businessTrips';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AllTripsTab() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: trips = [], isLoading } = useAllBusinessTrips(
    statusFilter !== 'all' ? { status: statusFilter as TripStatus } : {}
  );

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const employeeName = `${trip.employee?.first_name} ${trip.employee?.last_name}`.toLowerCase();
    const destination = trip.destination?.name?.toLowerCase() || '';
    return employeeName.includes(query) || destination.includes(query);
  });

  const handleExport = () => {
    if (!filteredTrips.length) return;
    
    const headers = ['Employee', 'Destination', 'Start Date', 'End Date', 'Nights', 'Budget (BHD)', 'Payable (BHD)', 'Corp Card', 'Status'];
    const rows = filteredTrips.map(trip => [
      `${trip.employee?.first_name} ${trip.employee?.last_name}`,
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
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-trips-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={handleExport} disabled={!filteredTrips.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTrips.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No trips found matching your criteria.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Nights</TableHead>
                <TableHead className="text-right">Budget (BHD)</TableHead>
                <TableHead className="text-right">Payable (BHD)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map(trip => (
                <TableRow
                  key={trip.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/business-trips/${trip.id}`)}
                >
                  <TableCell>
                    {trip.employee?.first_name} {trip.employee?.last_name}
                  </TableCell>
                  <TableCell>{trip.destination?.name}</TableCell>
                  <TableCell>
                    {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">{trip.nights_count}</TableCell>
                  <TableCell className="text-right">{trip.per_diem_budget_bhd.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{trip.per_diem_payable_bhd.toFixed(3)}</TableCell>
                  <TableCell>
                    <Badge className={cn(TRIP_STATUS_COLORS[trip.status])}>
                      {TRIP_STATUS_LABELS[trip.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
