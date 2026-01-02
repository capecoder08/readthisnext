import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "trending" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          {
            "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300":
              variant === "default",
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400":
              variant === "success",
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400":
              variant === "trending",
            "border border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 bg-transparent":
              variant === "outline",
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
