import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plane, Smartphone, Car, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { AirTicketUsageDialog } from './AirTicketUsageDialog';
import { PhonePaymentDialog } from './PhonePaymentDialog';
import type { BenefitType, AirTicketConfig, CarParkConfig, PhoneConfig, AirTicketData, PhoneData } from '@/types/benefits';

interface EntitlementTrackingCardProps {
  enrollmentId: string;
  employeeName: string;
  planType: BenefitType;
  entitlementConfig: AirTicketConfig | CarParkConfig | PhoneConfig | null;
  entitlementData: AirTicketData | PhoneData | null;
  compact?: boolean;
  showActions?: boolean;
}

export const EntitlementTrackingCard = ({
  enrollmentId,
  employeeName,
  planType,
  entitlementConfig,
  entitlementData,
  compact = false,
  showActions = true,
}: EntitlementTrackingCardProps) => {
  const [airTicketDialogOpen, setAirTicketDialogOpen] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const { formatCurrency } = useCompanySettings();

  if (!entitlementConfig) return null;

  // Air Ticket Tracking
  if (planType === 'air_ticket') {
    const config = entitlementConfig as AirTicketConfig;
    const data = entitlementData as AirTicketData | null;
    const ticketsUsed = data?.tickets_used || 0;
    const ticketsTotal = config.tickets_per_period;
    const ticketsRemaining = ticketsTotal - ticketsUsed;

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Plane className="h-4 w-4 text-sky-600" />
          <span className={cn(
            'font-medium',
            ticketsRemaining === 0 ? 'text-amber-600' : 'text-emerald-600'
          )}>
            {ticketsUsed}/{ticketsTotal} used
          </span>
        </div>
      );
    }

    return (
      <>
        <Card className="border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-sky-600" />
                <span className="font-medium">Air Ticket Entitlement</span>
              </div>
              {showActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAirTicketDialogOpen(true)}
                  className="border-sky-300 text-sky-700 hover:bg-sky-100"
                >
                  {ticketsRemaining > 0 ? 'Use Ticket' : 'View History'}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tickets Used</p>
                <p className="text-lg font-semibold">{ticketsUsed} / {ticketsTotal}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="text-lg font-semibold">{config.period_years} year(s)</p>
              </div>
            </div>
            {ticketsRemaining === 0 && (
              <p className="text-xs text-amber-600 mt-2">All tickets for this period used</p>
            )}
          </CardContent>
        </Card>

        <AirTicketUsageDialog
          open={airTicketDialogOpen}
          onOpenChange={setAirTicketDialogOpen}
          enrollmentId={enrollmentId}
          employeeName={employeeName}
          config={config}
          currentData={data}
        />
      </>
    );
  }

  // Phone Payment Tracking
  if (planType === 'phone') {
    const config = entitlementConfig as PhoneConfig;
    const data = entitlementData as PhoneData | null;
    const installmentsPaid = data?.installments_paid || 0;
    const totalPaid = data?.total_paid || 0;
    const remainingBalance = data?.remaining_balance ?? config.total_device_cost;
    const isFullyPaid = remainingBalance <= 0;
    const progressPercent = Math.min(100, (totalPaid / config.total_device_cost) * 100);

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Smartphone className="h-4 w-4 text-violet-600" />
          <span className={cn(
            'font-medium',
            isFullyPaid ? 'text-emerald-600' : ''
          )}>
            {installmentsPaid}/{config.installment_months} payments
          </span>
        </div>
      );
    }

    return (
      <>
        <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-violet-600" />
                <span className="font-medium">Phone Payment</span>
              </div>
              {showActions && !isFullyPaid && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPhoneDialogOpen(true)}
                  className="border-violet-300 text-violet-700 hover:bg-violet-100"
                >
                  Record Payment
                </Button>
              )}
              {isFullyPaid && (
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                  <Check className="h-4 w-4" />
                  Fully Paid
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="font-medium">{formatCurrency(totalPaid)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-medium">{formatCurrency(remainingBalance)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Installments</p>
                  <p className="font-medium">{installmentsPaid}/{config.installment_months}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <PhonePaymentDialog
          open={phoneDialogOpen}
          onOpenChange={setPhoneDialogOpen}
          enrollmentId={enrollmentId}
          employeeName={employeeName}
          config={config}
          currentData={data}
        />
      </>
    );
  }

  // Car Park (simple display, no tracking)
  if (planType === 'car_park') {
    const config = entitlementConfig as CarParkConfig;

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Car className="h-4 w-4 text-indigo-600" />
          <span className="font-medium">Active</span>
        </div>
      );
    }

    return (
      <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">Car Park Allocation</span>
          </div>
          {config.spot_location && (
            <p className="text-sm text-muted-foreground">
              Location: {config.spot_location}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Monthly allocation active
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};
