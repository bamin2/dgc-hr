import { Users } from "lucide-react";
import {
  EmployeeFilters,
  EmployeeTable,
  TablePagination,
  ColumnCustomizer,
} from "@/components/employees";
import { Employee } from "@/hooks/useEmployees";
import { EmployeeTableColumnId } from "@/data/settings";

interface EmployeeDirectoryTabProps {
  // Filter props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  workLocationFilter: string;
  onWorkLocationChange: (location: string) => void;

  // Column customization
  visibleColumns: EmployeeTableColumnId[];
  onColumnsChange: (columns: EmployeeTableColumnId[]) => void;
  isSavingColumns: boolean;

  // Employee data
  paginatedEmployees: Employee[];
  filteredEmployeesCount: number;
  selectedEmployees: string[];
  onSelectionChange: (ids: string[]) => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
  onEntriesPerPageChange: (entries: number) => void;

  // Actions
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onStartOnboarding: (employee: Employee) => void;
  onStartOffboarding: (employee: Employee) => void;
  canEdit: boolean;
}

export function EmployeeDirectoryTab({
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  workLocationFilter,
  onWorkLocationChange,
  visibleColumns,
  onColumnsChange,
  isSavingColumns,
  paginatedEmployees,
  filteredEmployeesCount,
  selectedEmployees,
  onSelectionChange,
  currentPage,
  totalPages,
  entriesPerPage,
  onPageChange,
  onEntriesPerPageChange,
  onView,
  onEdit,
  onDelete,
  onStartOnboarding,
  onStartOffboarding,
  canEdit,
}: EmployeeDirectoryTabProps) {
  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <EmployeeFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          departmentFilter={departmentFilter}
          onDepartmentChange={onDepartmentChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          workLocationFilter={workLocationFilter}
          onWorkLocationChange={onWorkLocationChange}
        />
        <ColumnCustomizer
          visibleColumns={visibleColumns}
          onColumnsChange={onColumnsChange}
          isSaving={isSavingColumns}
        />
      </div>

      {/* Employee List */}
      {filteredEmployeesCount === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            No employees found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <>
          <EmployeeTable
            employees={paginatedEmployees}
            selectedEmployees={selectedEmployees}
            visibleColumns={visibleColumns}
            onSelectionChange={onSelectionChange}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onStartOnboarding={onStartOnboarding}
            onStartOffboarding={onStartOffboarding}
            canEdit={canEdit}
          />
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEmployeesCount}
            entriesPerPage={entriesPerPage}
            onPageChange={onPageChange}
            onEntriesPerPageChange={onEntriesPerPageChange}
          />
        </>
      )}
    </>
  );
}
