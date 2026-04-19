import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveLeaveTypes } from '@/hooks/useLeaveTypes';
import { useBulkCreateLeaveRequests } from '@/hooks/useBulkCreateLeaveRequests';
import {
  readSheetRaw,
  suggestMapping,
  parseRowsWithMapping,
  getColumnValueCounts,
  getUnknownLeaveTypes,
  validateLeaveRow,
  buildLeaveInsertRecord,
  type LeaveImportPreviewRow,
  type LeaveColumnMapping,
  type LeaveFieldKey,
  type RawSheetData,
  type LeaveTypeResolution,
} from '@/utils/leaveHistoryImport';
import { useQuery } from '@tanstack/react-query';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROWS_PER_PAGE = 20;
const NONE_VALUE = '__none__';

const FIELD_LABELS: { key: LeaveFieldKey; label: string; required: boolean }[] = [
  { key: 'empNo', label: 'Employee Code', required: true },
  { key: 'transactionType', label: 'Transaction Type', required: true },
  { key: 'fromDate', label: 'From Date', required: true },
  { key: 'toDate', label: 'To Date', required: true },
  { key: 'status', label: 'Status', required: true },
  { key: 'noOfDays', label: 'No. of Days (optional)', required: false },
  { key: 'receivedOn', label: 'Received On (optional)', required: false },
  { key: 'empName', label: 'Employee Name (optional)', required: false },
];

const DEFAULT_ALLOWED = ['added by hr', 'approved'];

type ImportEmployee = { id: string; employee_code: string; first_name: string | null; last_name: string | null };

function useEmployeesForImport() {
  return useQuery({
    queryKey: ['employees-for-leave-import'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code, first_name, last_name')
        .not('employee_code', 'is', null);
      if (error) throw error;
      return (data || []) as ImportEmployee[];
    },
  });
}

type Step = 'upload' | 'map' | 'resolve' | 'preview';
const SKIP_VALUE = '__skip__';

export function LeaveHistoryImportDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [raw, setRaw] = useState<RawSheetData | null>(null);
  const [mapping, setMapping] = useState<LeaveColumnMapping | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [previewData, setPreviewData] = useState<LeaveImportPreviewRow[]>([]);
  const [ignoredCount, setIgnoredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [parsing, setParsing] = useState(false);
  const [unknownTypes, setUnknownTypes] = useState<{ value: string; count: number }[]>([]);
  const [typeResolutions, setTypeResolutions] = useState<Map<string, LeaveTypeResolution>>(new Map());
  const [parsedRowsCache, setParsedRowsCache] = useState<ReturnType<typeof parseRowsWithMapping> | null>(null);

  const { data: employees = [] } = useEmployeesForImport();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const bulkCreate = useBulkCreateLeaveRequests();

  const employeeByCode = useMemo(() => {
    const m = new Map<string, ImportEmployee>();
    for (const e of employees) {
      if (e.employee_code) m.set(e.employee_code.toLowerCase(), e);
    }
    return m;
  }, [employees]);

  const skippedCount = useMemo(
    () => previewData.filter(r => r.validation.errors[0] === 'Skipped (unknown leave type)').length,
    [previewData]
  );

  const validRows = useMemo(() => previewData.filter(r => r.validation.valid), [previewData]);
  const invalidRows = useMemo(() => previewData.filter(r => !r.validation.valid), [previewData]);

  const totalPages = Math.max(1, Math.ceil(previewData.length / ROWS_PER_PAGE));
  const paginatedData = previewData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const statusValueCounts = useMemo(() => {
    if (!raw || !mapping?.status) return new Map<string, number>();
    return getColumnValueCounts(raw.rows, mapping.status);
  }, [raw, mapping?.status]);

  // Pre-select default statuses when status column changes
  useEffect(() => {
    if (statusValueCounts.size === 0) return;
    const next = new Set<string>();
    for (const [val] of statusValueCounts) {
      if (DEFAULT_ALLOWED.includes(val.trim().toLowerCase())) next.add(val);
    }
    setSelectedStatuses(next);
  }, [statusValueCounts]);

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
      const sheetRaw = readSheetRaw(buffer);
      if (sheetRaw.headers.length === 0) {
        throw new Error('No columns detected in the first sheet');
      }
      setRaw(sheetRaw);
      setMapping(suggestMapping(sheetRaw.headers));
      setStep('map');
    } catch (err: any) {
      toast({ title: 'Failed to parse file', description: err.message || String(err), variant: 'destructive' });
      setFile(null);
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const requiredMappingComplete = useMemo(() => {
    if (!mapping) return false;
    return FIELD_LABELS.filter(f => f.required).every(f => mapping[f.key]);
  }, [mapping]);

  const buildPreview = useCallback((
    parseResult: ReturnType<typeof parseRowsWithMapping>,
    resolutions: Map<string, LeaveTypeResolution>
  ) => {
    const employeeLookup = employees.map(e => ({ id: e.id, employee_code: e.employee_code }));
    const leaveTypeLookup = leaveTypes.map(lt => ({ id: lt.id, name: lt.name }));
    const preview: LeaveImportPreviewRow[] = parseResult.rows.map(row => ({
      parsed: row,
      validation: validateLeaveRow(row, employeeLookup, leaveTypeLookup, resolutions),
    }));
    setPreviewData(preview);
    setIgnoredCount(parseResult.ignoredCount);
    setTotalCount(parseResult.totalCount);
    setCurrentPage(1);
  }, [employees, leaveTypes]);

  const handleGoToResolveOrPreview = useCallback(() => {
    if (!raw || !mapping) return;
    if (!requiredMappingComplete) {
      toast({ title: 'Mapping incomplete', description: 'Please map all required columns.', variant: 'destructive' });
      return;
    }
    if (selectedStatuses.size === 0) {
      toast({ title: 'No statuses selected', description: 'Pick at least one status to import.', variant: 'destructive' });
      return;
    }
    const result = parseRowsWithMapping(raw.rows, mapping, Array.from(selectedStatuses));
    setParsedRowsCache(result);

    const leaveTypeLookup = leaveTypes.map(lt => ({ id: lt.id, name: lt.name }));
    const unknowns = getUnknownLeaveTypes(result.rows, leaveTypeLookup);

    if (unknowns.length > 0) {
      setUnknownTypes(unknowns);
      // Drop resolutions whose key is no longer unknown
      setTypeResolutions(prev => {
        const next = new Map<string, LeaveTypeResolution>();
        const unknownSet = new Set(unknowns.map(u => u.value));
        for (const [k, v] of prev) if (unknownSet.has(k)) next.set(k, v);
        return next;
      });
      setStep('resolve');
      return;
    }

    buildPreview(result, new Map());
    setStep('preview');
  }, [raw, mapping, requiredMappingComplete, selectedStatuses, leaveTypes, buildPreview]);

  const allUnknownsResolved = useMemo(() => {
    if (unknownTypes.length === 0) return true;
    return unknownTypes.every(u => !!typeResolutions.get(u.value));
  }, [unknownTypes, typeResolutions]);

  const handleConfirmResolutions = useCallback(() => {
    if (!parsedRowsCache) return;
    if (!allUnknownsResolved) {
      toast({ title: 'Resolve all leave types', description: 'Pick a leave type or skip for each unknown.', variant: 'destructive' });
      return;
    }
    buildPreview(parsedRowsCache, typeResolutions);
    setStep('preview');
  }, [parsedRowsCache, allUnknownsResolved, typeResolutions, buildPreview]);

  const setResolution = (rawValue: string, value: string) => {
    setTypeResolutions(prev => {
      const next = new Map(prev);
      const stored: LeaveTypeResolution = value === SKIP_VALUE ? 'skip' : value;
      next.set(rawValue, stored);
      return next;
    });
  };

  const handleImport = async () => {
    if (validRows.length === 0) {
      toast({ title: 'No valid rows', description: 'Fix errors before importing', variant: 'destructive' });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const reviewerUserId = user?.id || null;
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

  const resetAll = () => {
    setStep('upload');
    setFile(null);
    setRaw(null);
    setMapping(null);
    setSelectedStatuses(new Set());
    setPreviewData([]);
    setIgnoredCount(0);
    setTotalCount(0);
    setCurrentPage(1);
    setUnknownTypes([]);
    setTypeResolutions(new Map());
    setParsedRowsCache(null);
  };

  const handleClose = () => {
    resetAll();
    onOpenChange(false);
  };

  const updateMapping = (field: LeaveFieldKey, value: string) => {
    setMapping(prev => prev ? { ...prev, [field]: value === NONE_VALUE ? null : value } : prev);
  };

  const toggleStatus = (val: string, checked: boolean) => {
    setSelectedStatuses(prev => {
      const next = new Set(prev);
      if (checked) next.add(val); else next.delete(val);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="4xl" className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Leave History</DialogTitle>
          <DialogDescription>
            Upload an Excel file, map columns, then preview before importing.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
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
                  {parsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Select File
                </Button>
              </label>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                After upload you'll map each column and choose which statuses to import.
                Imported leaves are marked <strong>Approved</strong> and do <strong>not</strong> automatically
                update employee leave balances.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'map' && raw && mapping && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{file?.name}</span>
              <span className="text-muted-foreground">{raw.rows.length} rows · {raw.headers.length} columns</span>
            </div>

            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Map your columns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FIELD_LABELS.map(({ key, label, required }) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs">
                          {label} {required && <span className="text-destructive">*</span>}
                        </Label>
                        <Select
                          value={mapping[key] ?? NONE_VALUE}
                          onValueChange={(v) => updateMapping(key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>— None —</SelectItem>
                            {raw.headers.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                {mapping.status && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Statuses to import</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Found in column "<strong>{mapping.status}</strong>" — select which statuses to include.
                    </p>
                    {statusValueCounts.size === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No values found in this column. Pick a different Status column above.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {Array.from(statusValueCounts.entries())
                          .sort((a, b) => b[1] - a[1])
                          .map(([val, count]) => {
                            const id = `status-${val}`;
                            return (
                              <label
                                key={val}
                                htmlFor={id}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/40"
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={id}
                                    checked={selectedStatuses.has(val)}
                                    onCheckedChange={(c) => toggleStatus(val, !!c)}
                                  />
                                  <span className="text-sm">{val}</span>
                                </div>
                                <Badge variant="outline">{count} rows</Badge>
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={resetAll}>
                Choose Different File
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button
                  onClick={handleGoToResolveOrPreview}
                  disabled={!requiredMappingComplete || selectedStatuses.size === 0}
                >
                  Preview <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'resolve' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Resolve unknown leave types</h4>
              <p className="text-xs text-muted-foreground">
                These values from your file don't match any leave type in the system.
                Pick which type to assign each one, or skip those rows.
              </p>
            </div>

            <ScrollArea className="flex-1 pr-3">
              <div className="border rounded-md divide-y">
                {unknownTypes.map(({ value, count }) => {
                  const current = typeResolutions.get(value);
                  const selectValue = current === 'skip' ? SKIP_VALUE : (current || undefined);
                  return (
                    <div key={value} className="flex items-center gap-3 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">"{value}"</div>
                        <div className="text-xs text-muted-foreground">{count} rows</div>
                      </div>
                      <div className="w-[260px]">
                        <Select
                          value={selectValue}
                          onValueChange={(v) => setResolution(value, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SKIP_VALUE}>— Skip these rows —</SelectItem>
                            {leaveTypes.map(lt => (
                              <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('map')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to Mapping
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleConfirmResolutions} disabled={!allUnknownsResolved}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
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
              {skippedCount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {skippedCount} skipped (unknown type)
                </Badge>
              )}
              <span className="text-muted-foreground">
                Total rows in file: {totalCount}
              </span>
              <span className="text-muted-foreground ml-auto">{file?.name}</span>
            </div>

            <ScrollArea className="h-[400px] border rounded-md">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Status</TableHead>
                      <TableHead>Emp. No.</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, index) => {
                      const matched = row.parsed.empNo
                        ? employeeByCode.get(row.parsed.empNo.toLowerCase())
                        : undefined;
                      const fullName = matched
                        ? `${matched.first_name ?? ''} ${matched.last_name ?? ''}`.trim()
                        : '';
                      const displayName = row.parsed.empName || fullName || '—';
                      return (
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
                        <TableCell className="text-sm">{displayName}</TableCell>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

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
              <Button variant="outline" onClick={() => setStep('map')}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to Mapping
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
