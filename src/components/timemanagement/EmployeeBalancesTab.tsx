import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Plus, Sparkles, RotateCcw, ArrowUpDown } from "lucide-react";
import { useAllEmployeeBalances, AllEmployeeBalance } from "@/hooks/useLeaveBalanceAdjustments";
import { useLeaveTypes, LeaveType } from "@/hooks/useLeaveTypes";
import { BalanceAdjustmentDialog } from "./BalanceAdjustmentDialog";
import { AssignLeaveBalanceDialog } from "./AssignLeaveBalanceDialog";
import { InitializeBalancesDialog } from "./InitializeBalancesDialog";
import { ProcessRolloverDialog } from "./ProcessRolloverDialog";

export function EmployeeBalancesTab() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedBalance, setSelectedBalance] = useState<{
    employee: AllEmployeeBalance;
    balanceIndex: number;
  } | null>(null);
  const [assignBalance, setAssignBalance] = useState<{
    employee: AllEmployeeBalance;
    leaveType: LeaveType;
  } | null>(null);
  const [showInitialize, setShowInitialize] = useState(false);
  const [showRollover, setShowRollover] = useState(false);
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'department'>('name-asc');

  const { data: employees, isLoading } = useAllEmployeeBalances(year);
  const { data: leaveTypes } = useLeaveTypes();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const departments = [...new Set(employees?.map((e) => e.department).filter(Boolean))];

  const filteredEmployees = employees?.filter((emp) => {
    const matchesSearch = emp.employee_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || emp.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const sortedEmployees = useMemo(() => {
    if (!filteredEmployees) return [];
    
    return [...filteredEmployees].sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.employee_name.localeCompare(b.employee_name);
        case 'name-desc':
          return b.employee_name.localeCompare(a.employee_name);
        case 'department':
          return (a.department || '').localeCompare(b.department || '');
        default:
          return 0;
      }
    });
  }, [filteredEmployees, sortOrder]);

  const handleAdjustBalance = (employee: AllEmployeeBalance, balanceIndex: number) => {
    setSelectedBalance({ employee, balanceIndex });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept!}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
          <SelectTrigger className="w-[150px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="department">Department</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInitialize(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Initialize Balances
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRollover(true)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Process Rollover
        </Button>
      </div>

      {/* Table */}
      {sortedEmployees.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No employee balances found.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[250px]">Employee</TableHead>
                <TableHead>Department</TableHead>
                {leaveTypes?.map((lt) => (
                  <TableHead key={lt.id} className="text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lt.color || '#6b7280' }}
                      />
                      <span className="text-xs">{lt.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <TableRow key={employee.employee_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={employee.employee_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {employee.employee_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {employee.employee_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {employee.department || "—"}
                    </Badge>
                  </TableCell>
                  {leaveTypes?.map((lt) => {
                    const balance = employee.balances.find(
                      (b) => b.leave_type_id === lt.id
                    );
                    const balanceIndex = employee.balances.findIndex(
                      (b) => b.leave_type_id === lt.id
                    );

                    return (
                      <TableCell key={lt.id} className="text-center">
                        {balance ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs"
                            onClick={() => handleAdjustBalance(employee, balanceIndex)}
                          >
                            <span className="text-muted-foreground">
                              {balance.used_days}
                            </span>
                            <span className="mx-1">/</span>
                            <span className="font-medium">{balance.total_days}</span>
                            {balance.pending_days > 0 && (
                              <span className="ml-1 text-warning">
                                (+{balance.pending_days})
                              </span>
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs text-muted-foreground"
                            onClick={() => setAssignBalance({ employee, leaveType: lt })}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedBalance && (
        <BalanceAdjustmentDialog
          open={!!selectedBalance}
          onOpenChange={(open) => !open && setSelectedBalance(null)}
          employee={selectedBalance.employee}
          balance={selectedBalance.employee.balances[selectedBalance.balanceIndex]}
        />
      )}

      {assignBalance && (
        <AssignLeaveBalanceDialog
          open={!!assignBalance}
          onOpenChange={(open) => !open && setAssignBalance(null)}
          employeeId={assignBalance.employee.employee_id}
          employeeName={assignBalance.employee.employee_name}
          employeeAvatar={assignBalance.employee.employee_avatar}
          leaveType={assignBalance.leaveType}
          year={year}
        />
      )}

      <InitializeBalancesDialog
        open={showInitialize}
        onOpenChange={setShowInitialize}
        year={year}
        employeeCount={employees?.length || 0}
      />

      <ProcessRolloverDialog
        open={showRollover}
        onOpenChange={setShowRollover}
        fromYear={year}
      />
    </div>
  );
}
