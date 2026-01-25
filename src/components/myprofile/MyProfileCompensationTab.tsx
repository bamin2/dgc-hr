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
      {/* Compensation Summary - Full Width */}
      <BentoCard colSpan={12}>
        <div className="flex items-center justify-between mb-6">
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
        
        <div className="relative min-h-[280px]">
          {/* Blur overlay when hidden - centered reveal */}
          {!isCompensationVisible && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md rounded-xl z-10">
              <button
                onClick={() => setIsCompensationVisible(true)}
                className="flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-6"
              >
                <div className="p-4 rounded-full bg-muted/50">
                  <Eye className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Click to reveal compensation</span>
              </button>
            </div>
          )}
          
          <div className={!isCompensationVisible ? 'blur-md select-none pointer-events-none' : ''}>
            {/* Base Salary */}
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-medium">Base Salary</span>
              </div>
              <span className="font-semibold text-lg tabular-nums">
                {currency} {baseSalary.toLocaleString()}
              </span>
            </div>

            {/* Allowances & Deductions - Side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Allowances */}
              <div className="border border-green-200/50 dark:border-green-900/30 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-green-50/50 dark:bg-green-950/20">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      Allowances
                    </span>
                  </div>
                  <span className="font-semibold text-green-700 dark:text-green-400 tabular-nums">
                    + {currency} {totalAllowances.toLocaleString()}
                  </span>
                </div>
                {showLineItems && allowanceItems.length > 0 && (
                  <div className="p-4 bg-background space-y-1">
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
              <div className="border border-red-200/50 dark:border-red-900/30 rounded-xl overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-700 dark:text-red-400">
                      Deductions
                    </span>
                  </div>
                  <span className="font-semibold text-red-700 dark:text-red-400 tabular-nums">
                    - {currency} {(totalDeductions + gosiDeduction).toLocaleString()}
                  </span>
                </div>
                {showLineItems && (
                  <div className="p-4 bg-background space-y-1">
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
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t mt-5">
              <div className="flex justify-between items-center p-4 bg-muted/20 rounded-xl">
                <span className="text-sm text-muted-foreground">Gross Pay</span>
                <span className="font-medium tabular-nums">
                  {currency} {grossPay.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                <span className="font-medium">Net Pay</span>
                <span className="font-bold text-lg text-primary tabular-nums">
                  {currency} {netPay.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Bank Details - Full Width */}
      <BentoCard colSpan={12}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-base font-medium">Bank Details</h3>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span className="text-xs">Sensitive</span>
          </div>
        </div>
        
        {/* Two-column grid on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Bank Name */}
          <div className="bg-muted/30 rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1.5">Bank Name</p>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground/70" />
              <span className="text-base font-medium">
                {employee.bankName || 'Not set'}
              </span>
            </div>
          </div>
          
          {/* Account Number */}
          <div className="bg-muted/30 rounded-xl p-5">
            <MaskedValue 
              label="Account Number" 
              value={employee.bankAccountNumber || ''} 
            />
          </div>
          
          {/* IBAN */}
          <div className="bg-muted/30 rounded-xl p-5 sm:col-span-2 lg:col-span-1">
            <MaskedValue 
              label="IBAN" 
              value={employee.iban || ''} 
            />
          </div>
        </div>
      </BentoCard>
    </BentoGrid>
  );
}
