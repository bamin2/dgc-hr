import { useState, useMemo } from "react";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmployeeFilters,
  EmployeeTable,
  EmployeeCard,
  EmployeeForm,
  ViewToggle,
} from "@/components/employees";
import { mockEmployees, Employee } from "@/data/employees";
import { toast } from "@/hooks/use-toast";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Filter and sort employees
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

    // Sorting
    result.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
          break;
        case 'employeeId':
          aVal = a.employeeId;
          bVal = b.employeeId;
          break;
        case 'department':
          aVal = a.department;
          bVal = b.department;
          break;
        case 'position':
          aVal = a.position;
          bVal = b.position;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'joinDate':
          aVal = new Date(a.joinDate).getTime();
          bVal = new Date(b.joinDate).getTime();
          break;
        default:
          aVal = `${a.firstName} ${a.lastName}`;
          bVal = `${b.firstName} ${b.lastName}`;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal;
    });

    return result;
  }, [employees, searchQuery, departmentFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleView = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setEmployees(prev => prev.filter(e => e.id !== employee.id));
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
      // Update existing employee
      setEmployees(prev => prev.map(e => 
        e.id === editingEmployee.id ? { ...e, ...data } : e
      ));
      toast({
        title: "Employee updated",
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
      });
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: String(Date.now()),
        employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        joinDate: new Date().toISOString().split('T')[0],
        ...data,
      } as Employee;
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Employee added",
        description: `${data.firstName} ${data.lastName} has been added to the directory.`,
      });
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">Employees</h1>
                  <Badge variant="secondary" className="font-normal">
                    {employees.length} total
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage your team members and their information
                </p>
              </div>
            </div>
            
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <EmployeeFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />
            <ViewToggle view={view} onViewChange={setView} />
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
          ) : view === 'table' ? (
            <EmployeeTable
              employees={filteredEmployees}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map(employee => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
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
