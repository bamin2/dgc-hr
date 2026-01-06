import { useState, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users } from "lucide-react";
import { useEmployees, useDepartments } from "@/hooks/useEmployees";
import { DirectoryCard } from "@/components/directory/DirectoryCard";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 12;

export default function Directory() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();

  // Filter only active employees
  const activeEmployees = useMemo(() => {
    return employees.filter(emp => emp.status === "active");
  }, [employees]);

  // Apply search and department filters
  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter(employee => {
      const matchesSearch = search === "" || 
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(search.toLowerCase());
      
      const matchesDepartment = departmentFilter === "all" || 
        employee.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [activeEmployees, search, departmentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const isLoading = employeesLoading || departmentsLoading;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Company Directory</h1>
            <p className="text-muted-foreground mt-1">
              Find and connect with colleagues across the organization
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {filteredEmployees.length} {filteredEmployees.length === 1 ? "colleague" : "colleagues"} found
            </span>
          </div>

          {/* Employee Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-6 rounded-lg border bg-card">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No colleagues found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedEmployees.map((employee) => (
                  <DirectoryCard key={employee.id} employee={employee} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm rounded-md border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm rounded-md border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
