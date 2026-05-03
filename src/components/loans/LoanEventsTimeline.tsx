import { format } from "date-fns";
import {
  Banknote,
  RefreshCw,
  SkipForward,
  Plus,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";
import { useLoanEvents, LoanEvent } from "@/hooks/useLoanEvents";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { Skeleton } from "@/components/ui/skeleton";

interface LoanEventsTimelineProps {
  loanId: string;
}

const eventConfig: Record<
  LoanEvent["event_type"],
  { icon: React.ElementType; label: string; color: string }
> = {
  disburse: { icon: Banknote, label: "Disbursed", color: "text-green-600" },
  top_up: { icon: Plus, label: "Top-up", color: "text-teal-600" },
  restructure: { icon: RefreshCw, label: "Restructured", color: "text-amber-600" },
  skip_installment: { icon: SkipForward, label: "Installment Skipped", color: "text-amber-600" },
  manual_payment: { icon: CreditCard, label: "Manual Payment", color: "text-emerald-600" },
  note: { icon: FileText, label: "Note", color: "text-muted-foreground" },
};

export function LoanEventsTimeline({ loanId }: LoanEventsTimelineProps) {
  const { data: events, isLoading } = useLoanEvents(loanId);
  const { formatCurrency } = useCompanySettings();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mb-2" />
        <p className="text-sm">No events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const config = eventConfig[event.event_type];
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-3">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-border -translate-x-1/2" />
            )}

            {/* Icon */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background ${config.color}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{config.label}</p>
                <time className="text-xs text-muted-foreground">
                  {format(new Date(event.created_at), "MMM d, yyyy")}
                </time>
              </div>

              <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
                {event.amount_delta && (
                  <p>Amount: {formatCurrency(event.amount_delta)}</p>
                )}
                {event.new_installment_amount && event.new_duration_months && (
                  <p>
                    New terms: {formatCurrency(event.new_installment_amount)}/mo for{" "}
                    {event.new_duration_months} months
                  </p>
                )}
                {event.notes && <p className="italic">{event.notes}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
