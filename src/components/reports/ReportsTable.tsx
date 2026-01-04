import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ReportTypeBadge } from './ReportTypeBadge';
import { Download, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { ReportSummary } from '@/data/reports';

interface ReportsTableProps {
  reports: ReportSummary[];
  onView: (reportId: string) => void;
  onDownload: (reportId: string) => void;
}

export const ReportsTable = ({ reports, onView, onDownload }: ReportsTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Report Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Last Generated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{report.name}</TableCell>
              <TableCell>
                <ReportTypeBadge type={report.type} />
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {report.description}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-sm">{report.frequency}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(report.lastGenerated), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onView(report.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDownload(report.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
