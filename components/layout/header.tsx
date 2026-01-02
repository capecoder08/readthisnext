"use client";

import Link from "next/link";
import { BookOpen, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Read This Next
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/library"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              My Library
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* User Avatar - Links to Profile */}
            <Link
              href="/profile"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              aria-label="Go to profile"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              ) : (
                <Menu className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200",
            mobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <Link
              href="/library"
              className="px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Library
            </Link>
            <Link
              href="/profile"
              className="px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
