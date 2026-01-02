import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-stone-300 dark:border-stone-600",
            "bg-white dark:bg-stone-800",
            "text-stone-900 dark:text-stone-100",
            "placeholder:text-stone-400 dark:placeholder:text-stone-500",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
            "transition-colors",
            icon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
