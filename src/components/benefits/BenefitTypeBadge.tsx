import { cn } from '@/lib/utils';
import { Heart, Smile, Eye, PiggyBank, Shield, Accessibility, Sparkles, HelpCircle } from 'lucide-react';
import type { BenefitType } from '@/hooks/useBenefitPlans';

interface BenefitTypeBadgeProps {
  type: BenefitType;
  showIcon?: boolean;
  className?: string;
}

const typeConfig: Record<BenefitType, { label: string; icon: typeof Heart; className: string }> = {
  health: {
    label: 'Health',
    icon: Heart,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  dental: {
    label: 'Dental',
    icon: Smile,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
  },
  vision: {
    label: 'Vision',
    icon: Eye,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  },
  retirement: {
    label: 'Retirement',
    icon: PiggyBank,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  },
  life: {
    label: 'Life',
    icon: Shield,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
  },
  disability: {
    label: 'Disability',
    icon: Accessibility,
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  },
  wellness: {
    label: 'Wellness',
    icon: Sparkles,
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  },
  other: {
    label: 'Other',
    icon: HelpCircle,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
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
