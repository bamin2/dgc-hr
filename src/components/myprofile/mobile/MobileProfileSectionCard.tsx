import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileProfileSectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  badge?: string | number;
}

export function MobileProfileSectionCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
  variant = 'default',
  badge,
}: MobileProfileSectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border bg-card text-left transition-all min-h-[60px]",
        "active:scale-[0.98] hover:bg-accent/50",
        variant === 'destructive' && "border-destructive/20 hover:bg-destructive/5"
      )}
    >
      <div
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
          variant === 'default' && "bg-primary/10 text-primary",
          variant === 'destructive' && "bg-destructive/10 text-destructive"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium",
            variant === 'destructive' && "text-destructive"
          )}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      
      {badge !== undefined && (
        <span className="h-6 min-w-[24px] px-2 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
          {badge}
        </span>
      )}
      
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  );
}
