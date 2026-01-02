"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "p-2 rounded-lg",
          "bg-stone-100 dark:bg-stone-800",
          "hover:bg-stone-200 dark:hover:bg-stone-700",
          "transition-colors"
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 text-stone-600 dark:text-stone-400" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-lg",
        "bg-stone-100 dark:bg-stone-800",
        "hover:bg-stone-200 dark:hover:bg-stone-700",
        "transition-colors"
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-stone-400" />
      ) : (
        <Moon className="h-5 w-5 text-stone-600" />
      )}
    </button>
  );
}
