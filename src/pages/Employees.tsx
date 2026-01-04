import { useState, useMemo, useEffect } from "react";
import { Plus, Upload, Users, Building2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  EmployeeFilters,
  EmployeeTable,
  EmployeeForm,
  TablePagination,
  OrgChart,
  OnboardingFilters,
  OnboardingTable,
} from "@/components/employees";
import { mockEmployees, Employee } from "@/data/employees";
import { mockOnboardingRecords, OnboardingRecord, OnboardingStatus } from "@/data/onboarding";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type TabType = 'directory' | 'org-chart' | 'onboarding';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'directory', label: 'People Directory', icon: Users },
  { id: 'org-chart', label: 'ORG Chart', icon: Building2 },
  { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
];

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [activeTab, setActiveTab] = useState<TabType>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(8);
  
  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Onboarding state
  const [onboardingRecords, setOnboardingRecords] = useState<OnboardingRecord[]>(mockOnboardingRecords);
  const [onboardingSearch, setOnboardingSearch] = useState('');
  const [onboardingStatusFilter, setOnboardingStatusFilter] = useState<OnboardingStatus | 'all'>('all');
  const [selectedOnboarding, setSelectedOnboarding] = useState<string[]>([]);
  const [onboardingPage, setOnboardingPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, entityFilter]);

  useEffect(() => {
    setOnboardingPage(1);
  }, [onboardingSearch, onboardingStatusFilter]);

  // Filter onboarding records
  const filteredOnboarding = useMemo(() => {
    let result = [...onboardingRecords];

    if (onboardingSearch) {
      const query = onboardingSearch.toLowerCase();
      result = result.filter(r => r.employeeName.toLowerCase().includes(query));
    }

    if (onboardingStatusFilter !== 'all') {
      result = result.filter(r => r.status === onboardingStatusFilter);
    }

    return result;
  }, [onboardingRecords, onboardingSearch, onboardingStatusFilter]);

  const onboardingTotalPages = Math.ceil(filteredOnboarding.length / entriesPerPage);
  const paginatedOnboarding = useMemo(() => {
    const startIndex = (onboardingPage - 1) * entriesPerPage;
    return filteredOnboarding.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredOnboarding, onboardingPage, entriesPerPage]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

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

    return result;
  }, [employees, searchQuery, departmentFilter, statusFilter]);

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

  const handleDelete = (employee: Employee) => {
    setEmployees(prev => prev.filter(e => e.id !== employee.id));
    setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
    toast({
      title: "Employee deleted",
      description: `${employee.firstName} ${employee.lastName} has been removed.`,
    });
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const handleSave = (data: Partial<Employee>) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(e => 
        e.id === editingEmployee.id ? { ...e, ...data } : e
      ));
      toast({
        title: "Employee updated",
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    } else {
      const newEmployee: Employee = {
        id: String(Date.now()),
        employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'on_boarding',
        ...data,
      } as Employee;
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Employee added",
        description: `${data.firstName} ${data.lastName} has been added to the directory.`,
      });
    }
  };

  const handleReassign = (employeeId: string, newManagerId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    const newManager = employees.find((e) => e.id === newManagerId);
    const originalManagerId = employee?.managerId;

    if (!employee || !newManager) return;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              managerId: newManagerId,
              manager: `${newManager.firstName} ${newManager.lastName}`,
            }
          : e
      )
    );

    toast({
      title: "Manager reassigned",
      description: `${employee.firstName} ${employee.lastName} now reports to ${newManager.firstName} ${newManager.lastName}.`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Undo the reassignment
            const originalManager = employees.find((e) => e.id === originalManagerId);
            setEmployees((prev) =>
              prev.map((e) =>
                e.id === employeeId
                  ? {
                      ...e,
                      managerId: originalManagerId,
                      manager: originalManager
                        ? `${originalManager.firstName} ${originalManager.lastName}`
                        : undefined,
                    }
                  : e
              )
            );
            toast({
              title: "Change undone",
              description: `${employee.firstName} ${employee.lastName}'s manager has been restored.`,
            });
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your employee data is being exported.",
    });
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
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Upload className="h-4 w-4" />
                Export
              </Button>
              {activeTab === 'onboarding' ? (
                <Button 
                  onClick={() => navigate("/employees/onboarding/new")} 
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Start Onboarding
                </Button>
              ) : (
                <Button onClick={handleAddNew} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              )}
            </div>
          </div>

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
              <div className="mb-6">
                <EmployeeFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  departmentFilter={departmentFilter}
                  onDepartmentChange={setDepartmentFilter}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  entityFilter={entityFilter}
                  onEntityChange={setEntityFilter}
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
                    onSelectionChange={setSelectedEmployees}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
            <OrgChart
              employees={employees}
              onView={(orgEmployee) => {
                navigate(`/employees/${orgEmployee.id}`);
              }}
              onEdit={(orgEmployee) => {
                // Find the full employee record by ID
                const employee = employees.find(e => e.id === orgEmployee.id);
                if (employee) {
                  setEditingEmployee(employee);
                  setFormOpen(true);
                }
              }}
              onReassign={handleReassign}
            />
          )}

          {activeTab === 'onboarding' && (
            <>
              <div className="mb-6">
                <OnboardingFilters
                  searchQuery={onboardingSearch}
                  onSearchChange={setOnboardingSearch}
                  statusFilter={onboardingStatusFilter}
                  onStatusFilterChange={setOnboardingStatusFilter}
                />
              </div>

              {filteredOnboarding.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-1">No onboarding records found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <>
                  <OnboardingTable
                    records={paginatedOnboarding}
                    selectedRecords={selectedOnboarding}
                    onSelectionChange={setSelectedOnboarding}
                    onEdit={(record) => {
                      toast({
                        title: "Edit onboarding",
                        description: `Editing ${record.employeeName}'s onboarding record.`,
                      });
                    }}
                    onDelete={(record) => {
                      setOnboardingRecords(prev => prev.filter(r => r.id !== record.id));
                      setSelectedOnboarding(prev => prev.filter(id => id !== record.id));
                      toast({
                        title: "Record deleted",
                        description: `${record.employeeName}'s onboarding record has been removed.`,
                      });
                    }}
                  />
                  <TablePagination
                    currentPage={onboardingPage}
                    totalPages={onboardingTotalPages}
                    totalItems={filteredOnboarding.length}
                    entriesPerPage={entriesPerPage}
                    onPageChange={setOnboardingPage}
                    onEntriesPerPageChange={(entries) => {
                      setEntriesPerPage(entries);
                      setOnboardingPage(1);
                    }}
                  />
                </>
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
    </div>
  );
}
