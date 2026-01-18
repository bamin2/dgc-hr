import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Download, CheckCircle2, XCircle, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useDepartments, usePositions, useEmployees } from "@/hooks/useEmployees";
import { useBulkCreateEmployees } from "@/hooks/useBulkCreateEmployees";
import {
  parseCSV,
  parseCSVToEmployees,
  validateEmployee,
  mapToDbEmployee,
  downloadCSVTemplate,
  ParsedEmployee,
  ValidationResult,
} from "@/utils/employeeImport";

interface EmployeeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewRow {
  parsed: ParsedEmployee;
  validation: ValidationResult;
}

const ROWS_PER_PAGE = 20;

export function EmployeeImportDialog({ open, onOpenChange }: EmployeeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: existingEmployees = [] } = useEmployees();
  const bulkCreate = useBulkCreateEmployees();

  const validRows = previewData.filter(r => r.validation.valid);
  const invalidRows = previewData.filter(r => !r.validation.valid);
  const warningRows = previewData.filter(r => r.validation.warnings.length > 0);
  
  const totalPages = Math.ceil(previewData.length / ROWS_PER_PAGE);
  const paginatedData = previewData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    const content = await selectedFile.text();
    const rows = parseCSV(content);
    const parsed = parseCSVToEmployees(rows);
    
    // Get existing emails for duplicate checking
    const existingEmails = existingEmployees.map(e => e.email);
    
    // Validate each row with duplicate checking
    const preview = parsed.map((p, index) => {
      const emailsBeforeThisRow = parsed.slice(0, index).map(e => e.email);
      return {
        parsed: p,
        validation: validateEmployee(p, existingEmails, emailsBeforeThisRow),
      };
    });
    
    setPreviewData(preview);
    setCurrentPage(1);
  }, [existingEmployees]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    if (validRows.length === 0) {
      toast({
        title: "No valid records",
        description: "Please fix the errors before importing",
        variant: "destructive",
      });
      return;
    }

    // Map existing employees to the format needed for manager lookup
    const employeesForLookup = existingEmployees.map(e => ({
      id: e.id,
      first_name: e.firstName,
      last_name: e.lastName,
    }));

    const dbRecords = validRows
      .map(r => mapToDbEmployee(r.parsed, departments, positions, employeesForLookup))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    try {
      await bulkCreate.mutateAsync({
        employees: dbRecords,
        filename: file?.name || "unknown.csv",
        totalRecords: previewData.length,
        failedRecords: invalidRows.length,
      });
      toast({
        title: "Import successful",
        description: `${dbRecords.length} employees imported successfully`,
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import employees",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setCurrentPage(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="4xl" className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Employees</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import employee records
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
              `}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button variant="outline" type="button" onClick={(e) => e.stopPropagation()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </label>
            </div>

            {/* Download Template */}
            <div className="flex justify-center">
              <Button variant="ghost" onClick={downloadCSVTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm">
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
              {warningRows.length > 0 && (
                <Badge variant="outline" className="gap-1 border-warning text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  {warningRows.length} warnings
                </Badge>
              )}
              <span className="text-muted-foreground ml-auto">
                {file.name}
              </span>
            </div>

            {/* Preview Table */}
            <ScrollArea className="h-[400px] border rounded-md">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] sticky left-0 bg-background">Status</TableHead>
                      <TableHead className="min-w-[150px]">Name</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[120px]">Department</TableHead>
                      <TableHead className="min-w-[120px]">Position</TableHead>
                      <TableHead className="min-w-[100px]">Hire Date</TableHead>
                      <TableHead className="min-w-[100px]">Work Type</TableHead>
                      <TableHead className="min-w-[150px]">Manager</TableHead>
                      <TableHead className="min-w-[200px]">Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, index) => (
                      <TableRow key={(currentPage - 1) * ROWS_PER_PAGE + index} className={!row.validation.valid ? 'bg-destructive/5' : ''}>
                        <TableCell className="sticky left-0 bg-background">
                          {row.validation.valid ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.parsed.employeeName}</TableCell>
                        <TableCell>{row.parsed.email}</TableCell>
                        <TableCell>{row.parsed.department || '-'}</TableCell>
                        <TableCell>{row.parsed.position || '-'}</TableCell>
                        <TableCell>{row.parsed.hiringDate || '-'}</TableCell>
                        <TableCell>{row.parsed.workType || '-'}</TableCell>
                        <TableCell>{row.parsed.directManager || '-'}</TableCell>
                        <TableCell>
                          {row.validation.errors.length > 0 && (
                            <span className="text-destructive text-xs">
                              {row.validation.errors.join(', ')}
                            </span>
                          )}
                          {row.validation.warnings.length > 0 && row.validation.errors.length === 0 && (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}-{Math.min(currentPage * ROWS_PER_PAGE, previewData.length)} of {previewData.length} rows
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreviewData([]);
                }}
              >
                Choose Different File
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validRows.length === 0 || bulkCreate.isPending}
                >
                  {bulkCreate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Import {validRows.length} Employees
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
