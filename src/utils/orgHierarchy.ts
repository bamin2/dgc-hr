import { Employee } from "@/hooks/useEmployees";
import { OrgEmployee } from "@/components/employees/OrgChartNode";

// Top-level positions that should appear at the root of org chart
const TOP_LEVEL_POSITIONS = [
  "ceo",
  "chief executive officer",
  "md",
  "managing director",
  "president",
  "chairman",
];

// Inactive statuses - employees with these statuses should be hidden
const INACTIVE_STATUSES = ["resigned", "terminated"];

/**
 * Check if an employee has an inactive status (resigned/terminated)
 */
export function isInactiveEmployee(employee: { status?: string | null }): boolean {
  if (!employee.status) return false;
  return INACTIVE_STATUSES.includes(employee.status.toLowerCase());
}

/**
 * Filter out inactive (resigned/terminated) employees
 */
export function filterActiveEmployees<T extends { status?: string | null }>(employees: T[]): T[] {
  return employees.filter(emp => !isInactiveEmployee(emp));
}

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
 * Check if a position is a top-level executive position
 */
export function isTopLevelPosition(employee: { position?: string | null }): boolean {
  if (!employee.position) return false;
  const normalizedPosition = employee.position.toLowerCase().trim();
  return TOP_LEVEL_POSITIONS.some(
    (topPos) =>
      normalizedPosition === topPos || normalizedPosition.includes(topPos)
  );
}

/**
 * Find root employees (CEO, MD - top-level executives without a manager)
 */
export function findRootEmployees(employees: Employee[]): Employee[] {
  // First, find employees without a manager AND with top-level positions
  const topLevelRoots = employees.filter(
    (emp) => !emp.managerId && isTopLevelPosition(emp)
  );

  // If we found top-level executives, return them
  if (topLevelRoots.length > 0) {
    return topLevelRoots;
  }

  // Fallback: find the first employee without a manager
  const rootWithoutManager = employees.find((emp) => !emp.managerId);
  return rootWithoutManager ? [rootWithoutManager] : [];
}

/**
 * Find the root employee (legacy - returns first root only)
 * @deprecated Use findRootEmployees for multi-root support
 */
export function findRootEmployee(employees: Employee[]): Employee | undefined {
  const roots = findRootEmployees(employees);
  return roots[0];
}

/**
 * Get direct reports for a given employee
 */
export function getDirectReports(employees: Employee[], managerId: string): Employee[] {
  return employees.filter((emp) => emp.managerId === managerId);
}

/**
 * Build a single org tree node recursively
 */
function buildNode(employee: Employee, employees: Employee[]): OrgEmployee {
  const orgEmployee = employeeToOrgEmployee(employee);
  const directReports = getDirectReports(employees, employee.id);

  if (directReports.length > 0) {
    orgEmployee.children = directReports.map((report) =>
      buildNode(report, employees)
    );
  }

  return orgEmployee;
}

/**
 * Build multiple org trees for multi-root support (CEO & MD side by side)
 */
export function buildOrgTrees(employees: Employee[]): OrgEmployee[] {
  if (employees.length === 0) return [];

  const roots = findRootEmployees(employees);
  if (roots.length === 0) return [];

  return roots.map((root) => buildNode(root, employees));
}

/**
 * Build a tree structure from flat employee array (legacy single-root)
 * @deprecated Use buildOrgTrees for multi-root support
 */
export function buildOrgTree(employees: Employee[]): OrgEmployee | null {
  const trees = buildOrgTrees(employees);
  return trees[0] || null;
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

  return buildNode(startingEmployee, employees);
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
