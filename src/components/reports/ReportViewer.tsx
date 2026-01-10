import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { ReportFiltersBar } from './ReportFiltersBar';
import { ReportFilters, ReportColumn, ExportFormat } from '@/types/reports';
import { exportToCSV, exportToExcel, exportToPDF, generateReportFilename } from '@/utils/reportExport';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportViewerProps {
  title: string;
  description?: string;
  filters: ReportFilters;
  onFilterChange: (filters: ReportFilters) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ReportColumn<any>[];
  isLoading: boolean;
  onRefresh?: () => void;
  summaryCards?: React.ReactNode;
  chart?: React.ReactNode;
  exportFormats: ExportFormat[];
  companyName?: string;
  locationName?: string;
  children?: React.ReactNode;
}

export function ReportViewer({
  title,
  description,
  filters,
  onFilterChange,
  data,
  columns,
  isLoading,
  onRefresh,
  summaryCards,
  chart,
  exportFormats,
  companyName,
  locationName,
  children,
}: ReportViewerProps) {
  const handleExport = (format: ExportFormat) => {
    const filename = generateReportFilename(title, format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv');
    
    if (format === 'csv') {
      exportToCSV(data, columns, filename);
    } else if (format === 'excel') {
      exportToExcel(data, columns, filename);
    } else if (format === 'pdf') {
      exportToPDF({
        title,
        data,
        columns,
        filename,
        companyName,
        locationName,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {exportFormats.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {exportFormats.includes('excel') && (
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to Excel
                  </DropdownMenuItem>
                )}
                {exportFormats.includes('csv') && (
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                )}
                {exportFormats.includes('pdf') && (
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to PDF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Filters */}
      <ReportFiltersBar filters={filters} onFiltersChange={onFilterChange} />

      {/* Summary Cards */}
      {summaryCards && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards}
        </div>
      )}

      {/* Chart */}
      {chart && (
        <Card>
          <CardContent className="pt-6">{chart}</CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data.length} {data.length === 1 ? 'Record' : 'Records'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
