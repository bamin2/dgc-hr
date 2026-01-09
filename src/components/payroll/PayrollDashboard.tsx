import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PayrollMetrics,
  PayrollFilters,
  PayrollTable,
  PayrollChart,
  RecentPayrollRuns,
} from "@/components/payroll";
import { usePayrollDashboardData, DashboardPayrollRecord } from "@/hooks/usePayrollDashboardData";
import { PayrollRecord } from "@/data/payroll";

interface PayrollDashboardProps {
  onRunPayroll: () => void;
}

export function PayrollDashboard({ onRunPayroll }: PayrollDashboardProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { 
    records, 
    metrics, 
    departmentData, 
    payrollRuns,
    isLoading 
  } = usePayrollDashboardData(monthFilter);

  // Transform DashboardPayrollRecord to PayrollRecord for the table
  const transformedRecords: PayrollRecord[] = records.map(r => ({
    id: r.id,
    employeeId: r.employeeId,
    employee: {
      id: r.employeeId,
      firstName: r.employee.firstName,
      lastName: r.employee.lastName,
      department: r.employee.department,
      position: r.employee.position,
      avatar: r.employee.avatar,
    },
    payPeriod: r.payPeriod,
    baseSalary: r.baseSalary,
    overtime: r.overtime,
    bonuses: r.bonuses,
    deductions: r.deductions,
    netPay: r.netPay,
    status: r.status,
    paidDate: r.paidDate,
  }));

  const filteredRecords = transformedRecords.filter((record) => {
    const matchesSearch =
      `${record.employee.firstName} ${record.employee.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.employee.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96" />
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no payroll data
  if (records.length === 0 && payrollRuns.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/team/bulk-salary-update")} className="gap-2">
            Bulk Update Salaries
          </Button>
          <Button onClick={onRunPayroll} className="gap-2">
            <Plus className="w-4 h-4" />
            Run Payroll
          </Button>
        </div>
        <Card className="p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Payroll Data Yet</h3>
          <p className="text-muted-foreground mb-4">
            Run your first payroll to see data here
          </p>
          <Button onClick={onRunPayroll}>Run Payroll</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/team/bulk-salary-update")} className="gap-2">
          Bulk Update Salaries
        </Button>
        <Button onClick={onRunPayroll} className="gap-2">
          <Plus className="w-4 h-4" />
          Run Payroll
        </Button>
      </div>

      {/* Metrics */}
      <PayrollMetrics
        totalPayroll={metrics.totalPayroll}
        employeesPaid={metrics.employeesPaid}
        pendingPayments={metrics.pendingPayments}
        averageSalary={metrics.averageSalary}
      />

      {/* Filters */}
      <PayrollFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        monthFilter={monthFilter}
        onMonthChange={setMonthFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table takes 2/3 */}
        <div className="lg:col-span-2">
          <PayrollTable records={filteredRecords} />
        </div>

        {/* Sidebar widgets take 1/3 */}
        <div className="space-y-6">
          <PayrollChart data={departmentData} />
          <RecentPayrollRuns runs={payrollRuns.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
