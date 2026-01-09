import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Calculator,
  Building2,
  CreditCard,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { useEmployeeAllowances } from '@/hooks/useEmployeeAllowances';
import { useEmployeeDeductions } from '@/hooks/useEmployeeDeductions';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { useState } from 'react';

interface MyProfileCompensationTabProps {
  employee: Employee;
  canViewCompensation?: boolean;
  showLineItems?: boolean;
}

interface CompensationItemProps {
  name: string;
  amount: number;
  currency: string;
  type: 'allowance' | 'deduction';
}

function CompensationItem({ name, amount, currency }: CompensationItemProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{name}</span>
      <span className="text-sm font-medium">
        {currency} {amount.toLocaleString()}
      </span>
    </div>
  );
}

function MaskedValue({ value, label }: { value: string; label: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const maskedValue = value ? `****${value.slice(-4)}` : '';
  
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium font-mono">
          {isVisible ? value : maskedValue || 'Not set'}
        </span>
        {value && (
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 hover:bg-muted rounded"
          >
            {isVisible ? (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function MyProfileCompensationTab({ 
  employee, 
  canViewCompensation = true,
  showLineItems = false 
}: MyProfileCompensationTabProps) {
  const { settings } = useCompanySettings();
  const { data: allowances, isLoading: loadingAllowances } = useEmployeeAllowances(employee.id);
  const { data: deductions, isLoading: loadingDeductions } = useEmployeeDeductions(employee.id);

  const currency = settings?.branding?.currency || 'USD';
  const baseSalary = employee.salary || 0;

  // Calculate totals
  const totalAllowances = allowances?.reduce((sum, a) => {
    const amount = a.custom_amount || a.allowance_template?.amount || 0;
    return sum + amount;
  }, 0) || 0;

  const totalDeductions = deductions?.reduce((sum, d) => {
    const amount = d.custom_amount || d.deduction_template?.amount || 0;
    return sum + amount;
  }, 0) || 0;

  // Include GOSI if applicable
  const gosiDeduction = employee.isSubjectToGosi && employee.gosiRegisteredSalary 
    ? employee.gosiRegisteredSalary * 0.1 // 10% GOSI
    : 0;

  const grossPay = baseSalary + totalAllowances;
  const netPay = grossPay - totalDeductions - gosiDeduction;

  if (!canViewCompensation) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Lock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            Compensation Details Not Available
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Contact your HR department for compensation information.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = loadingAllowances || loadingDeductions;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Salary Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Compensation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Salary */}
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-medium">Base Salary</span>
            </div>
            <span className="font-semibold text-lg">
              {currency} {baseSalary.toLocaleString()}
            </span>
          </div>

          {/* Allowances */}
          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Total Allowances
                </span>
              </div>
              <span className="font-semibold text-green-700 dark:text-green-400">
                + {currency} {totalAllowances.toLocaleString()}
              </span>
            </div>
            {showLineItems && allowances && allowances.length > 0 && (
              <div className="p-3 bg-background">
                {allowances.map((allowance) => (
                  <CompensationItem
                    key={allowance.id}
                    name={allowance.custom_name || allowance.allowance_template?.name || 'Allowance'}
                    amount={allowance.custom_amount || allowance.allowance_template?.amount || 0}
                    currency={currency}
                    type="allowance"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Deductions */}
          <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700 dark:text-red-400">
                  Total Deductions
                </span>
              </div>
              <span className="font-semibold text-red-700 dark:text-red-400">
                - {currency} {(totalDeductions + gosiDeduction).toLocaleString()}
              </span>
            </div>
            {showLineItems && (
              <div className="p-3 bg-background">
                {deductions?.map((deduction: any) => (
                  <CompensationItem
                    key={deduction.id}
                    name={deduction.custom_name || deduction.deduction_template?.name || 'Deduction'}
                    amount={deduction.custom_amount || deduction.deduction_template?.amount || 0}
                    currency={currency}
                    type="deduction"
                  />
                ))}
                {gosiDeduction > 0 && (
                  <CompensationItem
                    name="GOSI (Social Insurance)"
                    amount={gosiDeduction}
                    currency={currency}
                    type="deduction"
                  />
                )}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gross Pay</span>
              <span className="font-medium">
                {currency} {grossPay.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="font-medium">Net Pay</span>
              <span className="font-bold text-lg text-primary">
                {currency} {netPay.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Bank Name</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {employee.bankName || 'Not set'}
                </span>
              </div>
            </div>
            <MaskedValue 
              label="Account Number" 
              value={employee.bankAccountNumber || ''} 
            />
            <MaskedValue 
              label="IBAN" 
              value={employee.iban || ''} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}