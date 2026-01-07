import { useState, useMemo, useEffect } from "react";
import { Users, Building2, Loader2, Upload, History, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  EmployeeFilters,
  EmployeeTable,
  EmployeeForm,
  TablePagination,
  OrgChart,
  EmployeeExportButton,
  EmployeeImportDialog,
  ImportHistoryDialog,
  FormerEmployeesTable,
  ColumnCustomizer,
} from "@/components/employees";
import {
  useEmployees,
  useUpdateEmployee,
  useDeleteEmployee,
  Employee,
} from "@/hooks/useEmployees";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";
import { filterActiveEmployees } from "@/utils/orgHierarchy";
import { EmployeeTableColumnId } from "@/data/settings";

type TabType = 'directory' | 'org-chart' | 'former-employees';

export default function Employees() {
  const navigate = useNavigate();
  const { canEditEmployees } = useRole();
  
  // Build tabs dynamically based on user role
  const tabs = useMemo(() => {
    const baseTabs: { id: TabType; label: string; icon: React.ElementType }[] = [
      { id: 'directory', label: 'People Directory', icon: Users },
      { id: 'org-chart', label: 'ORG Chart', icon: Building2 },
    ];
    
    // Only show Former Employees tab to HR/Admin users
    if (canEditEmployees) {
      baseTabs.push({ id: 'former-employees', label: 'Former Employees', icon: Archive });
    }
    
    return baseTabs;
  }, [canEditEmployees]);
  
  // Fetch employees from Supabase
  const { data: employees = [], isLoading, error } = useEmployees();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const { preferences, updatePreferences, isSaving: isSavingPreferences } = useUserPreferences();
  
  const [activeTab, setActiveTab] = useState<TabType>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workLocationFilter, setWorkLocationFilter] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  
  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, workLocationFilter]);

  // Active employees only (filter out resigned/terminated)
  const activeEmployees = useMemo(() => 
    filterActiveEmployees(employees),
    [employees]
  );

  // Filter employees for directory (only active employees)
  const filteredEmployees = useMemo(() => {
    let result = [...activeEmployees];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      result = result.filter(emp => emp.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(emp => emp.status === statusFilter);
    }

    // Work location filter
    if (workLocationFilter !== 'all') {
      result = result.filter(emp => emp.workLocationId === workLocationFilter);
    }

    return result;
  }, [activeEmployees, searchQuery, departmentFilter, statusFilter, workLocationFilter]);


  // Paginate employees
  const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredEmployees.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredEmployees, currentPage, entriesPerPage]);

  const handleView = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    try {
      await deleteEmployee.mutateAsync(employee.id);
      setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
      toast({
        title: "Employee deleted",
        description: `${employee.firstName} ${employee.lastName} has been removed.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleSave = async (data: Partial<Employee>) => {
    if (!editingEmployee) return;
    
    try {
      await updateEmployee.mutateAsync({
        id: editingEmployee.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        department_id: data.departmentId || null,
        position_id: data.positionId || null,
        status: data.status as any,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender as any || null,
        address: data.address || null,
        nationality: data.nationality || null,
        avatar_url: data.avatar || null,
      });
      toast({
        title: "Employee updated",
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReassign = async (employeeId: string, newManagerId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    const newManager = employees.find((e) => e.id === newManagerId);

    if (!employee || !newManager) return;

    try {
      await updateEmployee.mutateAsync({
        id: employeeId,
        manager_id: newManagerId,
      });
      
      toast({
        title: "Manager reassigned",
        description: `${employee.firstName} ${employee.lastName} now reports to ${newManager.firstName} ${newManager.lastName}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reassign manager. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkReassign = async (assignments: { employeeId: string; managerId: string }[]) => {
    try {
      await Promise.all(
        assignments.map(({ employeeId, managerId }) => 
          updateEmployee.mutateAsync({
            id: employeeId,
            manager_id: managerId,
          })
        )
      );
      toast({
        title: "Managers assigned",
        description: `Updated ${assignments.length} employee(s).`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to assign managers. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-semibold text-foreground">People Directory</h1>
            
            {canEditEmployees && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setHistoryOpen(true)} className="gap-2">
                  <History className="h-4 w-4" />
                  Import History
                </Button>
                <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <EmployeeExportButton employees={filteredEmployees} />
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load employees. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Tabs */}
              <div className="border-b mb-6">
                <div className="flex gap-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors",
                          activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

          {activeTab === 'directory' && (
            <>
              {/* Filters */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <EmployeeFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  departmentFilter={departmentFilter}
                  onDepartmentChange={setDepartmentFilter}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  workLocationFilter={workLocationFilter}
                  onWorkLocationChange={setWorkLocationFilter}
                />
                <ColumnCustomizer
                  visibleColumns={preferences.display.employeeTableColumns}
                  onColumnsChange={(columns: EmployeeTableColumnId[]) => {
                    updatePreferences({ display: { ...preferences.display, employeeTableColumns: columns } });
                  }}
                  isSaving={isSavingPreferences}
                />
              </div>

              {/* Employee List */}
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No employees found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <>
                  <EmployeeTable
                    employees={paginatedEmployees}
                    selectedEmployees={selectedEmployees}
                    visibleColumns={preferences.display.employeeTableColumns}
                    onSelectionChange={setSelectedEmployees}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canEdit={canEditEmployees}
                  />
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredEmployees.length}
                    entriesPerPage={entriesPerPage}
                    onPageChange={setCurrentPage}
                    onEntriesPerPageChange={(entries) => {
                      setEntriesPerPage(entries);
                      setCurrentPage(1);
                    }}
                  />
                </>
              )}
            </>
          )}

              {activeTab === 'org-chart' && (
                <div className="overflow-hidden">
                  <OrgChart
                    employees={activeEmployees}
                    onView={(orgEmployee) => {
                      navigate(`/employees/${orgEmployee.id}`);
                    }}
                    onEdit={(orgEmployee) => {
                      // Find the full employee record by ID
                      const employee = activeEmployees.find(e => e.id === orgEmployee.id);
                      if (employee) {
                        setEditingEmployee(employee);
                        setFormOpen(true);
                      }
                    }}
                    onReassign={handleReassign}
                    onBulkReassign={handleBulkReassign}
                  />
                </div>
              )}

              {activeTab === 'former-employees' && (
                <FormerEmployeesTable />
              )}
            </>
          )}
        </main>
      </div>

      {/* Employee Form Modal */}
      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />

      {/* Employee Import Dialog */}
      <EmployeeImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />

      {/* Import History Dialog */}
      <ImportHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  );
}