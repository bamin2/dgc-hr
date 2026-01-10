import { DollarSign, Users, Clock, FileText } from 'lucide-react';
import { OverviewMetricCard } from './OverviewMetricCard';
import { PayrollSnapshot } from '@/hooks/useReportsOverview';
import { formatCurrencyWithCode } from '@/lib/salaryUtils';

interface PayrollSnapshotCardsProps {
  data: PayrollSnapshot;
  isLoading: boolean;
  onNavigate: (reportId: string) => void;
}

function formatCurrencyAmounts(amounts: { currencyCode: string; amount: number }[]): {
  display: string;
  tooltip: string | undefined;
} {
  if (amounts.length === 0) {
    return { display: '0', tooltip: undefined };
  }
  
  if (amounts.length === 1) {
    return {
      display: formatCurrencyWithCode(amounts[0].amount, amounts[0].currencyCode),
      tooltip: undefined,
    };
  }

  // Multiple currencies
  const tooltipLines = amounts
    .map(a => formatCurrencyWithCode(a.amount, a.currencyCode))
    .join('\n');
  
  return {
    display: 'Mixed Currencies',
    tooltip: `Values include multiple currencies:\n${tooltipLines}`,
  };
}

export function PayrollSnapshotCards({ data, isLoading, onNavigate }: PayrollSnapshotCardsProps) {
  const gross = formatCurrencyAmounts(data.totalGross);
  const net = formatCurrencyAmounts(data.totalNet);
  const gosi = formatCurrencyAmounts(data.employerGosi);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payroll Snapshot</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <OverviewMetricCard
          title="Total Payroll (Gross)"
          value={gross.display}
          subtitle="Finalized payroll runs"
          icon={DollarSign}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => onNavigate('payroll-run-summary')}
          tooltip={gross.tooltip || "Sum of gross pay from all finalized payroll runs in the selected period"}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Employer GOSI"
          value={gosi.display}
          subtitle="Employer contributions"
          icon={DollarSign}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          onClick={() => onNavigate('gosi-contribution')}
          tooltip={gosi.tooltip || "Total employer GOSI contribution for the selected period"}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Employees Paid"
          value={data.employeesPaid}
          subtitle="In finalized runs"
          icon={Users}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          onClick={() => onNavigate('payroll-detailed')}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Pending Runs"
          value={data.pendingRuns}
          subtitle="Draft payroll runs"
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          onClick={() => onNavigate('payroll-run-summary')}
          badge={data.pendingRuns > 0 ? { text: 'Action needed', variant: 'secondary' } : undefined}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Total Net Pay"
          value={net.display}
          subtitle="After deductions"
          icon={FileText}
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
          onClick={() => onNavigate('payroll-run-summary')}
          tooltip={net.tooltip || "Sum of net pay from all finalized payroll runs"}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
