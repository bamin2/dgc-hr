import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: [
          "bg-white/60 dark:bg-white/10",
          "border border-white/50 dark:border-white/20",
          "backdrop-blur-sm",
          "hover:bg-white/70 dark:hover:bg-white/15",
          "hover:text-accent-foreground",
        ].join(" "),
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // LiquidGlass - premium glassmorphism button for primary CTAs
        liquidGlass: [
          "bg-gradient-to-b from-[#18171C] to-[#312F37]",
          "text-white text-sm font-medium",
          "border border-[#18171C]",
          "rounded-[20px]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
          "transition-all duration-200",
          "hover:brightness-110 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
          "active:translate-y-px active:shadow-[0_1px_4px_rgba(0,0,0,0.1)]",
          "focus-visible:ring-2 focus-visible:ring-[#C6A45E]/40 focus-visible:ring-offset-2",
        ].join(" "),
        // LiquidGlass Secondary - translucent glass for Cancel actions
        liquidGlassSecondary: [
          "bg-white/60 dark:bg-white/10",
          "text-foreground text-sm font-medium",
          "border border-white/50 dark:border-white/20",
          "backdrop-blur-sm",
          "rounded-[20px]",
          "transition-all duration-200",
          "hover:bg-white/70 dark:hover:bg-white/15 hover:-translate-y-px",
          "active:translate-y-px",
          "focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
        icon: "h-11 w-11", // 44px - minimum touch target size
        "icon-sm": "h-9 w-9", // 36px - for dense desktop UIs, use sparingly
        // LiquidGlass sizing - fixed 48px height
        liquidGlass: "h-12 px-6",
        // LiquidGlass Secondary sizing - match primary height
        liquidGlassSecondary: "h-12 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
