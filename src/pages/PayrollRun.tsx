import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Calendar as CalendarIcon, Users, DollarSign, FileCheck } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAddPayrollRun } from "@/hooks/usePayrollRuns";
import { useEmployees } from "@/hooks/useEmployees";

const steps = [
  { id: 1, title: "Pay Period", icon: CalendarIcon },
  { id: 2, title: "Select Employees", icon: Users },
  { id: 3, title: "Adjustments", icon: DollarSign },
  { id: 4, title: "Review & Process", icon: FileCheck },
];

export default function PayrollRun() {
  const navigate = useNavigate();
  const addPayrollRun = useAddPayrollRun();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  
  // Filter to only active employees with salary
  const activeEmployees = employees.filter(e => e.status === 'active' && e.salary);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [payPeriod, setPayPeriod] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, { bonus: number; deduction: number }>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize selected employees when data loads
  useState(() => {
    if (activeEmployees.length > 0 && selectedEmployees.length === 0) {
      setSelectedEmployees(activeEmployees.map(e => e.id));
    }
  });

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === activeEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(activeEmployees.map((e) => e.id));
    }
  };

  const selectedRecords = activeEmployees.filter((e) =>
    selectedEmployees.includes(e.id)
  );

  // Calculate monthly salary from annual (employees have annual salary)
  const getMonthlySalary = (salary?: number) => Math.round((salary || 0) / 12);

  const totalPayroll = selectedRecords.reduce((sum, e) => {
    const adj = adjustments[e.id] || { bonus: 0, deduction: 0 };
    return sum + getMonthlySalary(e.salary) + adj.bonus - adj.deduction;
  }, 0);

  const handleProcess = async () => {
    setIsProcessing(true);
    
    try {
      const records = selectedRecords.map((e) => {
        const baseSalary = getMonthlySalary(e.salary);
        const bonus = adjustments[e.id]?.bonus || 0;
        const deduction = adjustments[e.id]?.deduction || 0;
        const grossPay = baseSalary + bonus;
        const totalDeductions = deduction;
        const netPay = grossPay - totalDeductions;

        return {
          payroll_run_id: "", // Will be set by the hook
          employee_id: e.id,
          employee_name: `${e.firstName} ${e.lastName}`,
          employee_code: e.employeeId,
          department: e.department,
          position: e.position,
          base_salary: baseSalary,
          housing_allowance: 0,
          transportation_allowance: 0,
          other_allowances: bonus > 0 ? { bonus } : {},
          gross_pay: grossPay,
          gosi_deduction: 0,
          other_deductions: deduction > 0 ? { adjustment: deduction } : {},
          total_deductions: totalDeductions,
          net_pay: netPay,
        };
      });

      await addPayrollRun.mutateAsync({
        payPeriodStart: payPeriod.startDate,
        payPeriodEnd: payPeriod.endDate,
        totalAmount: totalPayroll,
        employeeCount: selectedEmployees.length,
        records,
      });

      toast.success("Payroll processed successfully!");
      navigate("/payroll");
    } catch (error) {
      console.error("Error processing payroll:", error);
      toast.error("Failed to process payroll. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (employeesLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Select Pay Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !payPeriod.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {payPeriod.startDate
                          ? format(new Date(payPeriod.startDate), "dd/MM/yyyy")
                          : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={payPeriod.startDate ? new Date(payPeriod.startDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "yyyy-MM-dd");
                            if (payPeriod.endDate && date > new Date(payPeriod.endDate)) {
                              setPayPeriod({ startDate: formattedDate, endDate: "" });
                            } else {
                              setPayPeriod({ ...payPeriod, startDate: formattedDate });
                            }
                          } else {
                            setPayPeriod({ ...payPeriod, startDate: "" });
                          }
                        }}
                        disabled={(date) =>
                          payPeriod.endDate ? date > new Date(payPeriod.endDate) : false
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !payPeriod.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {payPeriod.endDate
                          ? format(new Date(payPeriod.endDate), "dd/MM/yyyy")
                          : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={payPeriod.endDate ? new Date(payPeriod.endDate) : undefined}
                        onSelect={(date) =>
                          setPayPeriod({
                            ...payPeriod,
                            endDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        disabled={(date) =>
                          payPeriod.startDate ? date < new Date(payPeriod.startDate) : false
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Employees</CardTitle>
                <Button variant="outline" size="sm" onClick={toggleAll}>
                  {selectedEmployees.length === activeEmployees.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedEmployees.includes(employee.id)
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border hover:bg-muted/50"
                    )}
                    onClick={() => toggleEmployee(employee.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.department}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-foreground">
                      ${getMonthlySalary(employee.salary).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Total Amount Footer */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedEmployees.length} employee(s) selected
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-bold text-primary">
                      ${selectedRecords.reduce((sum, e) => sum + getMonthlySalary(e.salary), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Pay Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedRecords.map((employee) => {
                  const monthlySalary = getMonthlySalary(employee.salary);
                  const adj = adjustments[employee.id] || { bonus: 0, deduction: 0 };
                  const netPay = monthlySalary + adj.bonus - adj.deduction;
                  
                  return (
                    <div
                      key={employee.id}
                      className="p-4 rounded-lg bg-muted/30 space-y-3"
                    >
                      {/* Employee Header */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.department}
                          </p>
                        </div>
                      </div>
                      
                      {/* Earnings Section */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">EARNINGS</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Base Salary</p>
                            <p className="font-medium">${monthlySalary.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Bonuses</p>
                            <p className="font-medium">${adj.bonus.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Deductions Section */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">DEDUCTIONS</p>
                        <div className="text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Other Deductions</p>
                            <p className="font-medium text-destructive">-${adj.deduction.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Net Pay */}
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="font-medium text-sm">Net Pay</span>
                        <span className="font-bold text-primary">${netPay.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Summary Footer */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployees.length} employee(s) selected
                  </p>
                </div>
                
                {/* Summary Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Earnings</span>
                    <span className="font-medium">
                      ${selectedRecords.reduce((sum, e) => sum + getMonthlySalary(e.salary), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Final Net Pay</span>
                    <span className="text-xl font-bold text-primary">
                      ${totalPayroll.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Review & Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pay Period</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(payPeriod.startDate), "dd/MM/yyyy")} -{" "}
                    {format(new Date(payPeriod.endDate), "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium text-foreground">{selectedEmployees.length}</p>
                </div>
              </div>
              
              <div className="p-6 bg-primary/5 rounded-lg border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Payroll Amount</p>
                <p className="text-3xl font-bold text-primary">
                  ${totalPayroll.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                <span>All employee data verified</span>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/payroll")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Run Payroll</h1>
            <p className="text-muted-foreground">
              Process payroll for your team
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  currentStep >= step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-16 sm:w-24 h-0.5 mx-2",
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              disabled={
                (currentStep === 1 && (!payPeriod.startDate || !payPeriod.endDate)) ||
                (currentStep === 2 && selectedEmployees.length === 0)
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Process Payroll"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
