import * as React from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

interface ResponsiveDialogProps {
  /** Control open state */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Optional description */
  description?: string;
  /** Dialog size on desktop */
  size?: DialogSize;
  /** Main content */
  children: React.ReactNode;
  /** Footer content (buttons) - sticky at bottom */
  footer?: React.ReactNode;
  /** Additional class names for content area */
  className?: string;
  /** Disable mobile sheet behavior */
  disableSheet?: boolean;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",      // 384px - confirmations
  md: "max-w-md",      // 448px - simple forms
  lg: "max-w-lg",      // 512px - standard forms
  xl: "max-w-xl",      // 576px - complex forms
  "2xl": "max-w-2xl",  // 672px - wizards
  "3xl": "max-w-3xl",  // 768px - previews
  "4xl": "max-w-4xl",  // 896px - large content
};

/**
 * ResponsiveDialog - Adaptive modal component
 * 
 * Features:
 * - Uses Dialog on desktop (centered modal)
 * - Uses Sheet on mobile (full-screen from bottom)
 * - Consistent max-height with scrollable content
 * - Sticky header and footer
 * 
 * @example
 * <ResponsiveDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Edit Employee"
 *   description="Update employee information"
 *   size="lg"
 *   footer={
 *     <div className="flex gap-3 justify-end">
 *       <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button onClick={handleSave}>Save</Button>
 *     </div>
 *   }
 * >
 *   <EmployeeForm />
 * </ResponsiveDialog>
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  size = "lg",
  children,
  footer,
  className,
  disableSheet = false,
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Use Sheet on mobile for full-screen experience
  if (isMobile && !disableSheet) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[90vh] flex flex-col p-0 rounded-t-xl"
        >
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b shrink-0">
            <SheetTitle>{title}</SheetTitle>
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>

          {/* Scrollable Content */}
          <div className={cn("flex-1 overflow-y-auto px-4 py-4", className)}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 border-t bg-background px-4 py-4">
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  // Use Dialog on tablet/desktop
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] flex flex-col p-0 gap-0"
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Scrollable Content */}
        <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t bg-background px-6 py-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * ResponsiveDialogFooter - Standard footer layout
 */
interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogFooter({
  children,
  className,
}: ResponsiveDialogFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
