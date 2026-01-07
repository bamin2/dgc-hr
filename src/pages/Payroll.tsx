import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  PayrollMetrics,
  PayrollFilters,
  PayrollTable,
  PayrollChart,
  RecentPayrollRuns,
} from "@/components/payroll";
import {
  mockPayrollRecords,
  payrollMetrics,
  departmentPayrollData,
} from "@/data/payroll";
import { usePayrollRuns } from "@/hooks/usePayrollRuns";

export default function Payroll() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: payrollRuns = [] } = usePayrollRuns();

  const filteredRecords = mockPayrollRecords.filter((record) => {
    const matchesSearch =
      `${record.employee.firstName} ${record.employee.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.employee.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payroll</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage employee salaries and process payroll
              </p>
            </div>
            <Button onClick={() => navigate("/payroll/run")} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Run Payroll
            </Button>
          </div>

          {/* Metrics */}
          <PayrollMetrics
            totalPayroll={payrollMetrics.totalPayroll}
            employeesPaid={payrollMetrics.employeesPaid}
            pendingPayments={payrollMetrics.pendingPayments}
            averageSalary={payrollMetrics.averageSalary}
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
              <PayrollChart data={departmentPayrollData} />
              <RecentPayrollRuns runs={payrollRuns.slice(0, 5)} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
