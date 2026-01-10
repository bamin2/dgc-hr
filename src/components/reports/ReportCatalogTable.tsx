import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Download, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { reportCatalog, getCategoryLabel, getCategoryColor } from '@/data/reportCatalog';
import { ExportFormat } from '@/types/reports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportCatalogTableProps {
  onViewReport?: (reportId: string) => void;
  onExportReport?: (reportId: string, format: ExportFormat) => void;
}

export function ReportCatalogTable({ onViewReport, onExportReport }: ReportCatalogTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reportCatalog.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Export Options</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(report.category)}>
                    {getCategoryLabel(report.category)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground max-w-md truncate">
                  {report.description}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {report.exportFormats.includes('excel') && (
                      <Badge variant="outline" className="text-xs">Excel</Badge>
                    )}
                    {report.exportFormats.includes('csv') && (
                      <Badge variant="outline" className="text-xs">CSV</Badge>
                    )}
                    {report.exportFormats.includes('pdf') && (
                      <Badge variant="outline" className="text-xs">PDF</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewReport?.(report.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {report.exportFormats.includes('excel') && (
                          <DropdownMenuItem onClick={() => onExportReport?.(report.id, 'excel')}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel
                          </DropdownMenuItem>
                        )}
                        {report.exportFormats.includes('csv') && (
                          <DropdownMenuItem onClick={() => onExportReport?.(report.id, 'csv')}>
                            <FileText className="h-4 w-4 mr-2" />
                            CSV
                          </DropdownMenuItem>
                        )}
                        {report.exportFormats.includes('pdf') && (
                          <DropdownMenuItem onClick={() => onExportReport?.(report.id, 'pdf')}>
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredReports.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
