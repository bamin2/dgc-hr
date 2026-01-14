import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  separator?: boolean; // Add separator after this item
}

interface MobileActionSheetProps {
  actions: Action[];
  title?: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function MobileActionSheet({
  actions,
  title = 'Actions',
  trigger,
  className,
}: MobileActionSheetProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    // Mobile: Bottom sheet with large touch targets
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || (
            <Button size="sm" variant="ghost" className="h-10 w-10">
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-safe">
            {actions.map((action, i) => (
              <div key={i}>
                <Button
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  className={cn(
                    'w-full justify-start h-14 text-base font-medium',
                    action.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (!action.disabled) {
                      action.onClick();
                    }
                  }}
                  disabled={action.disabled}
                >
                  <span className="mr-3 shrink-0">{action.icon}</span>
                  <span className="truncate">{action.label}</span>
                </Button>
                {action.separator && i < actions.length - 1 && (
                  <div className="h-px bg-border my-2" />
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost" className={cn('h-8 w-8', className)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action, i) => (
          <div key={i}>
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                action.variant === 'destructive' && 'text-destructive focus:text-destructive',
                'cursor-pointer'
              )}
            >
              <span className="mr-2 shrink-0">{action.icon}</span>
              <span className="truncate">{action.label}</span>
            </DropdownMenuItem>
            {action.separator && i < actions.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
