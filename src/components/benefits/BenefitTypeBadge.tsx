import { cn } from '@/lib/utils';
import { Heart, Smile, Eye, PiggyBank, Shield, Accessibility, Sparkles, HelpCircle, Plane, Car, Smartphone } from 'lucide-react';
import type { BenefitType } from '@/types/benefits';

interface BenefitTypeBadgeProps {
  type: BenefitType;
  showIcon?: boolean;
  className?: string;
}

const typeConfig: Record<BenefitType, { label: string; icon: typeof Heart; className: string }> = {
  health: {
    label: 'Health',
    icon: Heart,
    className: 'bg-success/10 text-success'
  },
  dental: {
    label: 'Dental',
    icon: Smile,
    className: 'bg-muted text-foreground'
  },
  vision: {
    label: 'Vision',
    icon: Eye,
    className: 'bg-warning/10 text-warning'
  },
  retirement: {
    label: 'Retirement',
    icon: PiggyBank,
    className: 'bg-muted text-foreground'
  },
  life: {
    label: 'Life',
    icon: Shield,
    className: 'bg-muted text-foreground'
  },
  disability: {
    label: 'Disability',
    icon: Accessibility,
    className: 'bg-muted text-muted-foreground'
  },
  wellness: {
    label: 'Wellness',
    icon: Sparkles,
    className: 'bg-muted text-foreground'
  },
  air_ticket: {
    label: 'Air Ticket',
    icon: Plane,
    className: 'bg-info/10 text-info'
  },
  car_park: {
    label: 'Car Park',
    icon: Car,
    className: 'bg-primary/10 text-primary'
  },
  phone: {
    label: 'Phone',
    icon: Smartphone,
    className: 'bg-primary/10 text-primary'
  },
  other: {
    label: 'Other',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground'
  }
};

export const BenefitTypeBadge = ({ type, showIcon = true, className }: BenefitTypeBadgeProps) => {
  const config = typeConfig[type] || typeConfig.other;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
};
