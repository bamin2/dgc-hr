import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { Plane, Car, Smartphone } from 'lucide-react';
import type { AirTicketConfig, CarParkConfig, PhoneConfig } from '@/hooks/useBenefitPlans';

interface AirTicketFieldsProps {
  config: AirTicketConfig;
  onChange: (config: AirTicketConfig) => void;
}

export function AirTicketConfigFields({ config, onChange }: AirTicketFieldsProps) {
  return (
    <div className="space-y-4 p-4 bg-sky-50 dark:bg-sky-950/20 rounded-lg border border-sky-200 dark:border-sky-800">
      <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400">
        <Plane className="h-4 w-4" />
        <span className="text-sm font-medium">Air Ticket Entitlement</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <FormLabel>Tickets per Period</FormLabel>
          <Input
            type="number"
            min={1}
            value={config.tickets_per_period}
            onChange={(e) => onChange({ ...config, tickets_per_period: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-2">
          <FormLabel>Period (Years)</FormLabel>
          <Input
            type="number"
            min={1}
            value={config.period_years}
            onChange={(e) => onChange({ ...config, period_years: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Employees will be entitled to {config.tickets_per_period} ticket(s) every {config.period_years} year(s)
      </p>
    </div>
  );
}

// CarParkConfigFields removed - car park plans use standard coverage levels
// Spot location is now assigned per-enrollment in the EnrollmentForm

interface PhoneFieldsProps {
  config: PhoneConfig;
  onChange: (config: PhoneConfig) => void;
  currency?: string;
}

export function PhoneConfigFields({ config, onChange, currency = 'BHD' }: PhoneFieldsProps) {
  const handleTotalCostChange = (value: number) => {
    const monthlyInstallment = config.installment_months > 0 
      ? value / config.installment_months 
      : 0;
    onChange({ 
      ...config, 
      total_device_cost: value,
      monthly_installment: Math.round(monthlyInstallment * 100) / 100
    });
  };

  const handleInstallmentMonthsChange = (value: number) => {
    const monthlyInstallment = value > 0 
      ? config.total_device_cost / value 
      : 0;
    onChange({ 
      ...config, 
      installment_months: value,
      monthly_installment: Math.round(monthlyInstallment * 100) / 100
    });
  };

  return (
    <div className="space-y-4 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800">
      <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
        <Smartphone className="h-4 w-4" />
        <span className="text-sm font-medium">Phone Entitlement</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <FormLabel>Total Device Cost ({currency})</FormLabel>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={config.total_device_cost || ''}
            onChange={(e) => handleTotalCostChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <FormLabel>Installment Months</FormLabel>
          <Input
            type="number"
            min={1}
            value={config.installment_months}
            onChange={(e) => handleInstallmentMonthsChange(parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-2">
          <FormLabel>Monthly Installment ({currency})</FormLabel>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={config.monthly_installment || ''}
            onChange={(e) => onChange({ ...config, monthly_installment: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Device will be paid off over {config.installment_months} months at {currency} {config.monthly_installment.toFixed(2)}/month
      </p>
    </div>
  );
}
