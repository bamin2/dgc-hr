import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { 
  exportEmployeesToCSV, 
  exportEmployeesToPDF, 
  exportEmployeesToJSON 
} from '@/utils/employeeExport';
import { toast } from '@/hooks/use-toast';

interface EmployeeExportButtonProps {
  employees: Employee[];
}

export function EmployeeExportButton({ employees }: EmployeeExportButtonProps) {
  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    if (employees.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no employees to export.",
        variant: "destructive",
      });
      return;
    }

    const filename = `employees_${new Date().toISOString().split('T')[0]}`;
    
    try {
      switch (format) {
        case 'csv':
          exportEmployeesToCSV(employees, filename);
          break;
        case 'pdf':
          exportEmployeesToPDF(employees, filename);
          break;
        case 'json':
          exportEmployeesToJSON(employees, filename);
          break;
      }
      
      toast({
        title: "Export successful",
        description: `${employees.length} employee(s) exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
