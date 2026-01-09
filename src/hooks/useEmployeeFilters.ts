import { useState, useMemo, useEffect, useCallback } from "react";
import { Employee } from "@/hooks/useEmployees";
import { filterActiveEmployees } from "@/utils/orgHierarchy";

interface EmployeeFiltersState {
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  workLocationFilter: string;
}

interface UseEmployeeFiltersReturn {
  // Filter state
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;
  workLocationFilter: string;
  
  // Setters
  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (dept: string) => void;
  setStatusFilter: (status: string) => void;
  setWorkLocationFilter: (location: string) => void;
  resetFilters: () => void;
  
  // Computed
  activeEmployees: Employee[];
  filteredEmployees: Employee[];
  hasActiveFilters: boolean;
}

const initialFilters: EmployeeFiltersState = {
  searchQuery: "",
  departmentFilter: "all",
  statusFilter: "all",
  workLocationFilter: "all",
};

export function useEmployeeFilters(
  employees: Employee[],
  onFiltersChange?: () => void
): UseEmployeeFiltersReturn {
  const [filters, setFilters] = useState<EmployeeFiltersState>(initialFilters);

  // Active employees only (filter out resigned/terminated)
  const activeEmployees = useMemo(
    () => filterActiveEmployees(employees),
    [employees]
  );

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    let result = [...activeEmployees];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (filters.departmentFilter !== "all") {
      result = result.filter((emp) => emp.department === filters.departmentFilter);
    }

    // Status filter
    if (filters.statusFilter !== "all") {
      result = result.filter((emp) => emp.status === filters.statusFilter);
    }

    // Work location filter
    if (filters.workLocationFilter !== "all") {
      result = result.filter((emp) => emp.workLocationId === filters.workLocationFilter);
    }

    return result;
  }, [activeEmployees, filters]);

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.departmentFilter !== "all" ||
    filters.statusFilter !== "all" ||
    filters.workLocationFilter !== "all";

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange?.();
  }, [filters, onFiltersChange]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setDepartmentFilter = useCallback((dept: string) => {
    setFilters((prev) => ({ ...prev, departmentFilter: dept }));
  }, []);

  const setStatusFilter = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, statusFilter: status }));
  }, []);

  const setWorkLocationFilter = useCallback((location: string) => {
    setFilters((prev) => ({ ...prev, workLocationFilter: location }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    searchQuery: filters.searchQuery,
    departmentFilter: filters.departmentFilter,
    statusFilter: filters.statusFilter,
    workLocationFilter: filters.workLocationFilter,
    setSearchQuery,
    setDepartmentFilter,
    setStatusFilter,
    setWorkLocationFilter,
    resetFilters,
    activeEmployees,
    filteredEmployees,
    hasActiveFilters,
  };
}
