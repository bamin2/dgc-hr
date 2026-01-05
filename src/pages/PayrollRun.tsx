import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Calendar, Users, DollarSign, FileCheck } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockPayrollRecords } from "@/data/payroll";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Pay Period", icon: Calendar },
  { id: 2, title: "Select Employees", icon: Users },
  { id: 3, title: "Adjustments", icon: DollarSign },
  { id: 4, title: "Review & Process", icon: FileCheck },
];

export default function PayrollRun() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [payPeriod, setPayPeriod] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    mockPayrollRecords.map((r) => r.employeeId)
  );
  const [adjustments, setAdjustments] = useState<Record<string, { bonus: number; deduction: number }>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === mockPayrollRecords.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(mockPayrollRecords.map((r) => r.employeeId));
    }
  };

  const selectedRecords = mockPayrollRecords.filter((r) =>
    selectedEmployees.includes(r.employeeId)
  );

  const totalPayroll = selectedRecords.reduce((sum, r) => {
    const adj = adjustments[r.employeeId] || { bonus: 0, deduction: 0 };
    return sum + r.netPay + adj.bonus - adj.deduction;
  }, 0);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payroll processed successfully!");
      navigate("/payroll");
    }, 2000);
  };

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
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={payPeriod.startDate}
                    onChange={(e) =>
                      setPayPeriod({ ...payPeriod, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={payPeriod.endDate}
                    onChange={(e) =>
                      setPayPeriod({ ...payPeriod, endDate: e.target.value })
                    }
                  />
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
                  {selectedEmployees.length === mockPayrollRecords.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPayrollRecords.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                      selectedEmployees.includes(record.employeeId)
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border hover:bg-muted/50"
                    )}
                    onClick={() => toggleEmployee(record.employeeId)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedEmployees.includes(record.employeeId)}
                        onCheckedChange={() => toggleEmployee(record.employeeId)}
                      />
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={record.employee.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.employee.firstName[0]}{record.employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {record.employee.firstName} {record.employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.employee.department}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-foreground">
                      ${record.netPay.toLocaleString()}
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
                      ${selectedRecords.reduce((sum, r) => sum + r.netPay, 0).toLocaleString()}
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
                {selectedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg bg-muted/30 space-y-3"
                  >
                    {/* Employee Header */}
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={record.employee.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.employee.firstName[0]}{record.employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {record.employee.firstName} {record.employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.employee.department}
                        </p>
                      </div>
                    </div>
                    
                    {/* Earnings Section */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Base Salary</p>
                        <p className="font-medium">${record.baseSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Overtime</p>
                        <p className="font-medium">${record.overtime.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Bonuses</p>
                        <p className="font-medium">${record.bonuses.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Deductions Section */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Tax</p>
                        <p className="font-medium text-destructive">-${record.deductions.tax.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Insurance</p>
                        <p className="font-medium text-destructive">-${record.deductions.insurance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Other</p>
                        <p className="font-medium text-destructive">-${record.deductions.other.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Net Pay */}
                    <div className="pt-2 border-t flex justify-between items-center">
                      <span className="font-medium text-sm">Net Pay</span>
                      <span className="font-bold text-primary">${record.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
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
                    {payPeriod.startDate} to {payPeriod.endDate}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium text-foreground">
                    {selectedEmployees.length} selected
                  </p>
                </div>
              </div>
              <div className="p-6 bg-primary/5 rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Payroll Amount</p>
                <p className="text-3xl font-bold text-primary">
                  ${totalPayroll.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Run Payroll</h1>
              <p className="text-muted-foreground">Process payroll for your employees</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 hidden sm:block",
                      currentStep >= step.id ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 sm:w-24 h-0.5 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleProcess} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Process Payroll"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
