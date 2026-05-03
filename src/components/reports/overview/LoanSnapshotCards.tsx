import { CreditCard, Wallet, CalendarClock } from 'lucide-react';
import { OverviewMetricCard } from './OverviewMetricCard';
import { LoanSnapshot } from '@/hooks/useReportsOverview';
import { formatCurrencyWithCode } from '@/lib/salaryUtils';

interface LoanSnapshotCardsProps {
  data: LoanSnapshot;
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

export function LoanSnapshotCards({ data, isLoading, onNavigate }: LoanSnapshotCardsProps) {
  const balance = formatCurrencyAmounts(data.outstandingBalance);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Loan Snapshot</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewMetricCard
          title="Active Loans"
          value={data.activeLoans}
          subtitle="Currently active"
          icon={CreditCard}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600 dark:text-rose-400"
          onClick={() => onNavigate('loan-summary')}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Outstanding Balance"
          value={balance.display}
          subtitle="Total remaining"
          icon={Wallet}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600 dark:text-rose-400"
          onClick={() => onNavigate('loan-summary')}
          tooltip={balance.tooltip || "Sum of unpaid installments for all active loans"}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Installments Due"
          value={data.installmentsDueThisMonth}
          subtitle="This month"
          icon={CalendarClock}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          onClick={() => onNavigate('loan-installments')}
          badge={data.installmentsDueThisMonth > 0 ? { text: 'Upcoming', variant: 'outline' } : undefined}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
