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
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCountryCodeByName } from '@/data/countries';
import { GosiNationalityRate } from '@/hooks/useWorkLocations';
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';

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

interface CalculatedItem {
  id: string;
  name: string;
  amount: number;
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
  const [isCompensationVisible, setIsCompensationVisible] = useState(false);
  const { settings } = useCompanySettings();
  const { data: allowances, isLoading: loadingAllowances } = useEmployeeAllowances(employee.id);
  const { data: deductions, isLoading: loadingDeductions } = useEmployeeDeductions(employee.id);

  // Fetch work location for GOSI rates
  const { data: workLocation, isLoading: loadingWorkLocation } = useQuery({
    queryKey: ['work-location', employee.workLocationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_locations')
        .select('id, name, gosi_enabled, gosi_nationality_rates')
        .eq('id', employee.workLocationId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!employee.workLocationId && !!employee.isSubjectToGosi,
  });

  const currency = settings?.branding?.currency || 'USD';
  const baseSalary = employee.salary || 0;

  // Calculate allowances with proper percentage handling
  const { totalAllowances, allowanceItems } = useMemo(() => {
    if (!allowances) return { totalAllowances: 0, allowanceItems: [] as CalculatedItem[] };
    
    let total = 0;
    const items: CalculatedItem[] = allowances.map(a => {
      let amount = 0;
      const name = a.custom_name || a.allowance_template?.name || 'Allowance';
      
      if (a.custom_amount) {
        amount = a.custom_amount;
      } else if (a.allowance_template) {
        const template = a.allowance_template;
        if (template.amount_type === 'percentage' && template.percentage_of === 'base_salary') {
          amount = (baseSalary * template.amount) / 100;
        } else {
          amount = template.amount || 0;
        }
      }
      
      total += amount;
      return { id: a.id, name, amount };
    });
    
    return { totalAllowances: total, allowanceItems: items };
  }, [allowances, baseSalary]);

  // Calculate deductions with proper percentage handling
  const { totalDeductions, deductionItems } = useMemo(() => {
    if (!deductions) return { totalDeductions: 0, deductionItems: [] as CalculatedItem[] };
    
    let total = 0;
    const items: CalculatedItem[] = deductions.map(d => {
      let amount = 0;
      const name = d.custom_name || d.deduction_template?.name || 'Deduction';
      
      if (d.custom_amount) {
        amount = d.custom_amount;
      } else if (d.deduction_template) {
        const template = d.deduction_template;
        if (template.amount_type === 'percentage' && template.percentage_of === 'base_salary') {
          amount = (baseSalary * template.amount) / 100;
        } else {
          amount = template.amount || 0;
        }
      }
      
      total += amount;
      return { id: d.id, name, amount };
    });
    
    return { totalDeductions: total, deductionItems: items };
  }, [deductions, baseSalary]);

  // Calculate GOSI deduction with location-specific nationality rates
  const gosiDeduction = useMemo(() => {
    if (!employee.isSubjectToGosi) return 0;
    
    // Check if work location has GOSI enabled
    const gosiEnabled = workLocation?.gosi_enabled;
    if (!gosiEnabled) return 0;
    
    // Get GOSI base (registered salary or fall back to base salary)
    const gosiBase = employee.gosiRegisteredSalary || baseSalary;
    if (!gosiBase) return 0;
    
    // Get nationality-specific rate from work location settings
    const rates = (workLocation?.gosi_nationality_rates as unknown as GosiNationalityRate[]) || [];
    const nationalityCode = getCountryCodeByName(employee.nationality || '');
    const matchingRate = rates.find(r => r.nationality === nationalityCode);
    
    if (matchingRate) {
      // Support both old (percentage) and new (employeeRate) formats
      const employeeRate = (matchingRate as any).employeeRate ?? (matchingRate as any).percentage ?? 0;
      return (gosiBase * employeeRate) / 100;
    }
    
    return 0;
  }, [employee.isSubjectToGosi, employee.gosiRegisteredSalary, employee.nationality, baseSalary, workLocation]);

  const grossPay = baseSalary + totalAllowances;
  const netPay = grossPay - totalDeductions - gosiDeduction;

  if (!canViewCompensation) {
    return (
      <BentoGrid noPadding>
        <BentoCard colSpan={12}>
          <div className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Compensation Details Not Available
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Contact your HR department for compensation information.
            </p>
          </div>
        </BentoCard>
      </BentoGrid>
    );
  }

  const isLoading = loadingAllowances || loadingDeductions || loadingWorkLocation;

  if (isLoading) {
    return (
      <BentoGrid noPadding>
        <BentoCard colSpan={8}>
          <Skeleton className="h-48 w-full" />
        </BentoCard>
        <BentoCard colSpan={4}>
          <Skeleton className="h-32 w-full" />
        </BentoCard>
      </BentoGrid>
    );
  }

  return (
    <BentoGrid noPadding>
      {/* Salary Summary - Main Card */}
      <BentoCard colSpan={8}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <h3 className="text-base font-medium">Compensation Summary</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCompensationVisible(!isCompensationVisible)}
            className="h-8 w-8"
          >
            {isCompensationVisible ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        <div className="space-y-4 relative">
          {/* Blur overlay when hidden */}
          {!isCompensationVisible && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-lg z-10">
              <button
                onClick={() => setIsCompensationVisible(true)}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="h-8 w-8" />
                <span className="text-sm font-medium">Click to reveal</span>
              </button>
            </div>
          )}
          
          <div className={!isCompensationVisible ? 'blur-md select-none' : ''}>
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
            <div className="border rounded-lg overflow-hidden mt-3">
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
              {showLineItems && allowanceItems.length > 0 && (
                <div className="p-3 bg-background">
                  {allowanceItems.map((item) => (
                    <CompensationItem
                      key={item.id}
                      name={item.name}
                      amount={item.amount}
                      currency={currency}
                      type="allowance"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Deductions */}
            <div className="border rounded-lg overflow-hidden mt-3">
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
                  {deductionItems.map((item) => (
                    <CompensationItem
                      key={item.id}
                      name={item.name}
                      amount={item.amount}
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
            <div className="space-y-2 pt-4 border-t mt-4">
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
          </div>
        </div>
      </BentoCard>

      {/* Bank Details */}
      <BentoCard colSpan={4}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-primary" />
          <h3 className="text-base font-medium">Bank Details</h3>
        </div>
        <div className="space-y-4">
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
      </BentoCard>
    </BentoGrid>
  );
}
