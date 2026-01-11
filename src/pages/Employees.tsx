import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import {
  EmployeesPageHeader,
  EmployeesTabs,
  EmployeeDirectoryTab,
  EmployeeDialogs,
  OrgChart,
  FormerEmployeesTable,
} from "@/components/employees";
import type { EmployeesTabType } from "@/components/employees/EmployeesTabs";
import { useEmployees, Employee } from "@/hooks/useEmployees";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useRole } from "@/contexts/RoleContext";
import { useEmployeeFilters } from "@/hooks/useEmployeeFilters";
import { usePagination } from "@/hooks/usePagination";
import { useEmployeeActions } from "@/hooks/useEmployeeActions";
import { TeamMember } from "@/hooks/employee";
import { EmployeeTableColumnId } from "@/data/settings";
import { useTimeToFirstData } from "@/lib/perf";
import { EmployeesLoadingSkeleton } from "@/components/ui/table-skeleton";

export default function Employees() {
  const navigate = useNavigate();
  const { canEditEmployees } = useRole();

  // Fetch employees from Supabase
  const { data: employees = [], isLoading, error } = useEmployees();
  const { preferences, updatePreferences, isSaving: isSavingPreferences } = useUserPreferences();

  // Track time to first data
  useTimeToFirstData('Employees List', isLoading);

  // Tab state
  const [activeTab, setActiveTab] = useState<EmployeesTabType>("directory");

  // Selection state
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [offboardingOpen, setOffboardingOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Employee | null>(null);

  // Custom hooks for filters and pagination
  const {
    searchQuery,
    departmentFilter,
    statusFilter,
    workLocationFilter,
    setSearchQuery,
    setDepartmentFilter,
    setStatusFilter,
    setWorkLocationFilter,
    activeEmployees,
    filteredEmployees,
  } = useEmployeeFilters(employees);

  const pagination = usePagination(filteredEmployees, {
    initialEntriesPerPage: 8,
  });

  // Reset pagination when filters change
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      pagination.resetToFirstPage();
    },
    [setSearchQuery, pagination]
  );

  const handleDepartmentChange = useCallback(
    (dept: string) => {
      setDepartmentFilter(dept);
      pagination.resetToFirstPage();
    },
    [setDepartmentFilter, pagination]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setStatusFilter(status);
      pagination.resetToFirstPage();
    },
    [setStatusFilter, pagination]
  );

  const handleWorkLocationChange = useCallback(
    (location: string) => {
      setWorkLocationFilter(location);
      pagination.resetToFirstPage();
    },
    [setWorkLocationFilter, pagination]
  );

  // Employee actions
  const {
    handleView,
    handleDelete,
    handleSave,
    handleReassign,
    handleBulkReassign,
  } = useEmployeeActions((deletedId) => {
    setSelectedEmployees((prev) => prev.filter((id) => id !== deletedId));
  });

  const handleEdit = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  }, []);

  const handleFormSave = useCallback(
    async (data: Partial<Employee>) => {
      if (!editingEmployee) return;
      await handleSave(editingEmployee, data);
    },
    [editingEmployee, handleSave]
  );

  // Convert Employee to TeamMember for dialogs
  const convertToTeamMember = (employee: Employee): TeamMember => ({
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    avatar: employee.avatar,
    workerType: "employee",
    startDate: employee.joinDate || new Date().toISOString(),
    department: employee.department || "",
    departmentId: employee.departmentId,
    jobTitle: employee.position || "",
    positionId: employee.positionId,
    employmentType: "full_time",
    status: "active",
    managerId: employee.managerId,
    workLocation: employee.workLocationId,
    salary: employee.salary,
    payFrequency: "month",
  });

  const handleColumnsChange = useCallback(
    (columns: EmployeeTableColumnId[]) => {
      updatePreferences({
        display: { ...preferences.display, employeeTableColumns: columns },
      });
    },
    [updatePreferences, preferences.display]
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <EmployeesPageHeader
        canEdit={canEditEmployees}
        employees={filteredEmployees}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenImport={() => setImportOpen(true)}
      />

      {/* Loading State - Skeleton instead of spinner */}
      {isLoading && <EmployeesLoadingSkeleton />}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">
            Failed to load employees. Please try again.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Tabs */}
          <EmployeesTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            canViewFormerEmployees={canEditEmployees}
          />

          {activeTab === "directory" && (
            <EmployeeDirectoryTab
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              departmentFilter={departmentFilter}
              onDepartmentChange={handleDepartmentChange}
              statusFilter={statusFilter}
              onStatusChange={handleStatusChange}
              workLocationFilter={workLocationFilter}
              onWorkLocationChange={handleWorkLocationChange}
              visibleColumns={preferences.display.employeeTableColumns}
              onColumnsChange={handleColumnsChange}
              isSavingColumns={isSavingPreferences}
              paginatedEmployees={pagination.paginatedItems}
              filteredEmployeesCount={filteredEmployees.length}
              selectedEmployees={selectedEmployees}
              onSelectionChange={setSelectedEmployees}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              entriesPerPage={pagination.entriesPerPage}
              onPageChange={pagination.setCurrentPage}
              onEntriesPerPageChange={pagination.setEntriesPerPage}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStartOnboarding={(employee) => {
                setSelectedMember(employee);
                setOnboardingOpen(true);
              }}
              onStartOffboarding={(employee) => {
                setSelectedMember(employee);
                setOffboardingOpen(true);
              }}
              canEdit={canEditEmployees}
            />
          )}

          {activeTab === "org-chart" && (
            <div className="overflow-hidden">
              <OrgChart
                employees={activeEmployees}
                onView={(orgEmployee) => {
                  navigate(`/employees/${orgEmployee.id}`);
                }}
                onEdit={(orgEmployee) => {
                  const employee = activeEmployees.find(
                    (e) => e.id === orgEmployee.id
                  );
                  if (employee) {
                    setEditingEmployee(employee);
                    setFormOpen(true);
                  }
                }}
                onReassign={(employeeId, newManagerId) =>
                  handleReassign(employeeId, newManagerId, employees)
                }
                onBulkReassign={handleBulkReassign}
              />
            </div>
          )}

          {activeTab === "former-employees" && <FormerEmployeesTable />}
        </>
      )}

      {/* All Dialogs */}
      <EmployeeDialogs
        formOpen={formOpen}
        onFormOpenChange={setFormOpen}
        editingEmployee={editingEmployee}
        onSave={handleFormSave}
        importOpen={importOpen}
        onImportOpenChange={setImportOpen}
        historyOpen={historyOpen}
        onHistoryOpenChange={setHistoryOpen}
        onboardingOpen={onboardingOpen}
        onOnboardingOpenChange={setOnboardingOpen}
        onboardingMember={selectedMember ? convertToTeamMember(selectedMember) : null}
        onOnboardingComplete={() => setOnboardingOpen(false)}
        offboardingOpen={offboardingOpen}
        onOffboardingOpenChange={setOffboardingOpen}
        offboardingMember={selectedMember ? convertToTeamMember(selectedMember) : null}
        onOffboardingComplete={() => setOffboardingOpen(false)}
      />
    </DashboardLayout>
  );
}
