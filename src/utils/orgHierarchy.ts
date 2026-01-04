import { Employee } from "@/data/employees";
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
