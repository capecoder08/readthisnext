import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            // Variants
            "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500":
              variant === "primary",
            "bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700":
              variant === "secondary",
            "bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300":
              variant === "ghost",
            "border border-stone-300 dark:border-stone-600 bg-transparent hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300":
              variant === "outline",
            // Sizes
            "text-sm px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
