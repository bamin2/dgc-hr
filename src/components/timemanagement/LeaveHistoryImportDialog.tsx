import { useState, useCallback, useMemo } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  Loader2, ChevronLeft, ChevronRight, Info,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { useBulkCreateLeaveRequests } from '@/hooks/useBulkCreateLeaveRequests';
import {
  parseLeaveHistoryXLSX,
  validateLeaveRow,
  buildLeaveInsertRecord,
  type LeaveImportPreviewRow,
} from '@/utils/leaveHistoryImport';
import { useQuery } from '@tanstack/react-query';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROWS_PER_PAGE = 20;

function useEmployeesForImport() {
  return useQuery({
    queryKey: ['employees-for-leave-import'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code')
        .not('employee_code', 'is', null);
      if (error) throw error;
      return (data || []) as { id: string; employee_code: string }[];
    },
  });
}

export function LeaveHistoryImportDialog({ open, onOpenChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<LeaveImportPreviewRow[]>([]);
  const [ignoredCount, setIgnoredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [parsing, setParsing] = useState(false);

  const { data: employees = [] } = useEmployeesForImport();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const bulkCreate = useBulkCreateLeaveRequests();

  const validRows = useMemo(() => previewData.filter(r => r.validation.valid), [previewData]);
  const invalidRows = useMemo(() => previewData.filter(r => !r.validation.valid), [previewData]);

  const totalPages = Math.max(1, Math.ceil(previewData.length / ROWS_PER_PAGE));
  const paginatedData = previewData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    const lower = selectedFile.name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      toast({ title: 'Invalid file type', description: 'Please upload an Excel (.xlsx) file', variant: 'destructive' });
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = parseLeaveHistoryXLSX(buffer);
      const employeeLookup = employees.map(e => ({ id: e.id, employee_code: e.employee_code }));
      const leaveTypeLookup = leaveTypes.map(lt => ({ id: lt.id, name: lt.name }));

      const preview: LeaveImportPreviewRow[] = result.rows.map(row => ({
        parsed: row,
        validation: validateLeaveRow(row, employeeLookup, leaveTypeLookup),
      }));

      setPreviewData(preview);
      setIgnoredCount(result.ignoredCount);
      setTotalCount(result.totalCount);
      setCurrentPage(1);
    } catch (err: any) {
      toast({ title: 'Failed to parse file', description: err.message || String(err), variant: 'destructive' });
      setFile(null);
    } finally {
      setParsing(false);
    }
  }, [employees, leaveTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleImport = async () => {
    if (validRows.length === 0) {
      toast({ title: 'No valid rows', description: 'Fix errors before importing', variant: 'destructive' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const reviewerUserId = user?.id || null;
    // reviewed_by expects an employee id in this schema – fetch current user's employee id
    let reviewerEmployeeId: string | null = null;
    if (reviewerUserId) {
      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', reviewerUserId)
        .maybeSingle();
      reviewerEmployeeId = emp?.id || null;
    }

    const records = validRows
      .map(r => buildLeaveInsertRecord(r.parsed, r.validation, reviewerEmployeeId))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    try {
      const { inserted } = await bulkCreate.mutateAsync(records);
      toast({ title: 'Import successful', description: `${inserted} leave requests imported` });
      handleClose();
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message || 'Could not insert records', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setIgnoredCount(0);
    setTotalCount(0);
    setCurrentPage(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="4xl" className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Leave History</DialogTitle>
          <DialogDescription>
            Upload an Excel file to bulk import historical leave records.
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="leave-xlsx-upload"
              />
              <label htmlFor="leave-xlsx-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">Drag and drop your Excel file here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse (.xlsx, .xls)</p>
                <Button variant="outline" type="button" onClick={(e) => e.stopPropagation()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </label>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Only rows with status <strong>Approved</strong> or <strong>Added by HR</strong> will be imported.
                Imported leaves are marked <strong>Approved</strong> and do <strong>not</strong> automatically
                update employee leave balances. Adjust balances manually via Employee Balances if needed.
              </AlertDescription>
            </Alert>

            <div className="text-xs text-muted-foreground">
              Expected columns: <em>Emp. No., Transaction Type, From Date, To Date, Received On, No. of Days, Status</em>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-success" />
                {validRows.length} valid
              </Badge>
              {invalidRows.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  {invalidRows.length} errors
                </Badge>
              )}
              {ignoredCount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {ignoredCount} ignored (status filter)
                </Badge>
              )}
              <span className="text-muted-foreground">
                Total rows in file: {totalCount}
              </span>
              <span className="text-muted-foreground ml-auto">{file.name}</span>
            </div>

            {parsing ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] border rounded-md">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Status</TableHead>
                        <TableHead>Emp. No.</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((row, index) => (
                        <TableRow
                          key={(currentPage - 1) * ROWS_PER_PAGE + index}
                          className={!row.validation.valid ? 'bg-destructive/5' : ''}
                        >
                          <TableCell>
                            {row.validation.valid ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{row.parsed.empNo || '-'}</TableCell>
                          <TableCell>{row.parsed.transactionType || '-'}</TableCell>
                          <TableCell>{row.parsed.fromDate || '-'}</TableCell>
                          <TableCell>{row.parsed.toDate || '-'}</TableCell>
                          <TableCell>{row.parsed.noOfDays}</TableCell>
                          <TableCell>
                            {row.validation.errors.length > 0 && (
                              <span className="text-destructive text-xs">
                                {row.validation.errors.join(', ')}
                              </span>
                            )}
                            {row.validation.errors.length === 0 && row.validation.warnings.length > 0 && (
                              <span className="text-warning text-xs">
                                {row.validation.warnings.join(', ')}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, previewData.length)} of {previewData.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-muted-foreground">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { setFile(null); setPreviewData([]); setIgnoredCount(0); setTotalCount(0); }}
              >
                Choose Different File
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleImport} disabled={validRows.length === 0 || bulkCreate.isPending}>
                  {bulkCreate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Import {validRows.length} Leaves
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
