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
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // LiquidGlass - premium glassmorphism button for primary CTAs
        liquidGlass: [
          "bg-gradient-to-b from-[#18171C] to-[#312F37]",
          "text-white font-medium",
          "border border-[#18171C]",
          "rounded-[20px]",
          "btn-liquid-glass-shadow",
          "transition-all duration-200",
          "hover:brightness-110 hover:-translate-y-px hover:btn-liquid-glass-shadow-hover",
          "active:translate-y-px active:btn-liquid-glass-shadow-active",
          "focus-visible:ring-[#C6A45E]/40",
        ].join(" "),
        // LiquidGlass Secondary - translucent glass for Cancel actions
        liquidGlassSecondary: [
          "bg-black/[0.03] dark:bg-white/[0.08]",
          "text-foreground/80 font-medium",
          "border border-black/10 dark:border-white/15",
          "rounded-[20px]",
          "btn-liquid-glass-secondary-shadow",
          "transition-all duration-200",
          "hover:bg-black/[0.06] dark:hover:bg-white/[0.12] hover:-translate-y-px hover:btn-liquid-glass-secondary-shadow-hover",
          "active:translate-y-px active:btn-liquid-glass-secondary-shadow-active",
          "focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-11 w-11", // 44px - minimum touch target size
        "icon-sm": "h-9 w-9", // 36px - for dense desktop UIs, use sparingly
        // LiquidGlass responsive sizing - 48px mobile, 52px desktop
        liquidGlass: "h-12 sm:h-[52px] px-5 sm:px-6 text-sm sm:text-base",
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
