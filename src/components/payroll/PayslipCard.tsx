import { Download, Printer } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PayrollRecord } from "@/data/payroll";
import { format } from "date-fns";

interface PayslipCardProps {
  record: PayrollRecord;
}

export function PayslipCard({ record }: PayslipCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const totalEarnings = record.baseSalary + record.overtime + record.bonuses;
  const totalDeductions = record.deductions.tax + record.deductions.insurance + record.deductions.other;

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <span className="font-bold text-xl">F</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Franfer Inc.</h2>
              <p className="text-sm opacity-80">123 Business Street, San Francisco, CA</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 border-0">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button variant="secondary" size="sm" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 border-0">
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Pay Period & Employee Info */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14">
              <AvatarImage src={record.employee.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {record.employee.firstName[0]}{record.employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {record.employee.firstName} {record.employee.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{record.employee.position}</p>
              <p className="text-sm text-muted-foreground">{record.employee.department}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted-foreground">Pay Period</p>
            <p className="font-medium text-foreground">
              {format(new Date(record.payPeriod.startDate), 'MMM d')} - {format(new Date(record.payPeriod.endDate), 'MMM d, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Employee ID: {record.employee.employeeId}</p>
          </div>
        </div>

        <Separator />

        {/* Earnings */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Earnings</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Salary</span>
              <span className="text-foreground">{formatCurrency(record.baseSalary)}</span>
            </div>
            {record.overtime > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overtime</span>
                <span className="text-success">+{formatCurrency(record.overtime)}</span>
              </div>
            )}
            {record.bonuses > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonuses</span>
                <span className="text-success">+{formatCurrency(record.bonuses)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span>Total Earnings</span>
              <span>{formatCurrency(totalEarnings)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Deductions */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Deductions</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Federal Tax</span>
              <span className="text-destructive">-{formatCurrency(record.deductions.tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Health Insurance</span>
              <span className="text-destructive">-{formatCurrency(record.deductions.insurance)}</span>
            </div>
            {record.deductions.other > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Deductions</span>
                <span className="text-destructive">-{formatCurrency(record.deductions.other)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span>Total Deductions</span>
              <span className="text-destructive">-{formatCurrency(totalDeductions)}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Net Pay */}
        <div className="bg-primary/5 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Net Pay</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(record.netPay)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
