import { Employee } from "@/hooks/useEmployees";
import { OrgEmployee } from "@/components/employees/OrgChartNode";

/**
 * Convert an Employee to OrgEmployee format
 */
export function employeeToOrgEmployee(employee: Employee): OrgEmployee {
  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    position: employee.position,
    department: employee.department,
    location: employee.location || "Boston HQ",
    avatar: employee.avatar,
    children: [],
  };
}

/**
 * Find the root employee (CEO - no managerId)
 */
export function findRootEmployee(employees: Employee[]): Employee | undefined {
  return employees.find((emp) => !emp.managerId);
}

/**
 * Get direct reports for a given employee
 */
export function getDirectReports(employees: Employee[], managerId: string): Employee[] {
  return employees.filter((emp) => emp.managerId === managerId);
}

/**
 * Build a tree structure from flat employee array
 */
export function buildOrgTree(employees: Employee[]): OrgEmployee | null {
  if (employees.length === 0) return null;

  const root = findRootEmployee(employees);
  if (!root) return null;

  const buildNode = (employee: Employee): OrgEmployee => {
    const orgEmployee = employeeToOrgEmployee(employee);
    const directReports = getDirectReports(employees, employee.id);
    
    if (directReports.length > 0) {
      orgEmployee.children = directReports.map(buildNode);
    }
    
    return orgEmployee;
  };

  return buildNode(root);
}

/**
 * Get all descendant IDs for an employee (for drop validation)
 */
export function getAllDescendantIds(
  employees: Employee[],
  employeeId: string
): string[] {
  const descendants: string[] = [];
  const directReports = getDirectReports(employees, employeeId);

  for (const report of directReports) {
    descendants.push(report.id);
    descendants.push(...getAllDescendantIds(employees, report.id));
  }

  return descendants;
}

/**
 * Check if moving employee to target would create a circular reference
 */
export function wouldCreateCircularReference(
  employees: Employee[],
  employeeId: string,
  targetManagerId: string
): boolean {
  if (employeeId === targetManagerId) return true;
  const descendants = getAllDescendantIds(employees, employeeId);
  return descendants.includes(targetManagerId);
}

/**
 * Build a tree structure starting from a specific employee
 */
export function buildOrgTreeFromEmployee(
  employees: Employee[],
  startingEmployeeId: string
): OrgEmployee | null {
  const startingEmployee = employees.find((e) => e.id === startingEmployeeId);
  if (!startingEmployee) return null;

  const buildNode = (employee: Employee): OrgEmployee => {
    const orgEmployee = employeeToOrgEmployee(employee);
    const directReports = getDirectReports(employees, employee.id);

    if (directReports.length > 0) {
      orgEmployee.children = directReports.map(buildNode);
    }

    return orgEmployee;
  };

  return buildNode(startingEmployee);
}

/**
 * Get all employees who have at least one direct report (managers) or are the root
 */
export function getEmployeesWithReports(employees: Employee[]): Employee[] {
  const managerIds = new Set(
    employees.filter((e) => e.managerId).map((e) => e.managerId)
  );
  return employees.filter((e) => managerIds.has(e.id) || !e.managerId);
}
