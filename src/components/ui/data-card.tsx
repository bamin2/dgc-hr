import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataCardField {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface DataCardAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

type DataCardActionWithOptionalProps = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
};

interface DataCardProps {
  /** Primary title/name */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Avatar or icon element */
  avatar?: React.ReactNode;
  /** Data fields to display */
  fields?: DataCardField[];
  /** Action menu items */
  actions?: DataCardAction[];
  /** Selection checkbox */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  /** Click handler for card */
  onClick?: () => void;
  /** Status badge */
  badge?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * DataCard - Mobile-friendly card representation of table rows
 * 
 * Use when displaying table data on mobile devices.
 * Converts complex table rows into readable card format.
 * 
 * @example
 * <DataCard
 *   title="John Doe"
 *   subtitle="Software Engineer"
 *   avatar={<Avatar>JD</Avatar>}
 *   fields={[
 *     { label: "Department", value: "Engineering" },
 *     { label: "Email", value: "john@example.com" },
 *   ]}
 *   actions={[
 *     { label: "Edit", onClick: () => {} },
 *     { label: "Delete", onClick: () => {}, destructive: true },
 *   ]}
 *   badge={<Badge>Active</Badge>}
 * />
 */
export function DataCard({
  title,
  subtitle,
  avatar,
  fields,
  actions,
  selectable,
  selected,
  onSelect,
  onClick,
  badge,
  className,
}: DataCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm",
        selected && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}

          {/* Avatar */}
          {avatar && <div className="shrink-0">{avatar}</div>}

          {/* Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground truncate">{title}</h4>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className={action.destructive ? "text-destructive" : undefined}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Fields Grid */}
        {fields && fields.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {fields.map((field, index) => (
              <div key={index} className={field.className}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="text-sm text-foreground mt-0.5">{field.value}</dd>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * DataCardList - Container for DataCard components
 */
interface DataCardListProps {
  children: React.ReactNode;
  className?: string;
}

export function DataCardList({ children, className }: DataCardListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
}

/**
 * DataCardSkeleton - Loading state for DataCard
 */
export function DataCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
