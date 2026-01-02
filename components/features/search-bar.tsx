"use client";

import { Search, Loader2, BookOpen } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { searchGoogleBooks } from "@/lib/google-books";
import type { GoogleBook } from "@/types";

interface SearchBarProps {
  onBookSelect?: (book: GoogleBook) => void;
  onSearch?: (query: string) => void;
}

export function SearchBar({ onBookSelect, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchBooks = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const books = await searchGoogleBooks(searchQuery);
      setResults(books);
      setShowDropdown(books.length > 0);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchBooks(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchBooks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBook = (book: GoogleBook) => {
    setQuery(book.title);
    setShowDropdown(false);
    onBookSelect?.(book);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectBook(results[selectedIndex]);
        } else if (query.trim()) {
          onSearch?.(query);
          setShowDropdown(false);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      handleSelectBook(results[selectedIndex]);
    } else if (query.trim()) {
      onSearch?.(query);
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex gap-2 p-1.5 rounded-xl transition-all duration-300",
            "bg-white dark:bg-stone-900",
                          "transition-colors"
          )}
        >
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
              ) : (
                <Search className="h-5 w-5 text-stone-400" />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for a book title or author..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (results.length > 0) setShowDropdown(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-lg",
                "bg-transparent",
                "text-stone-900 dark:text-stone-100 text-base",
                "placeholder:text-stone-400 dark:placeholder:text-stone-500",

              )}
              autoComplete="off"
            />
          </div>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg overflow-hidden">
          <ul className="max-h-96 overflow-y-auto">
            {results.map((book, index) => (
              <li key={book.id}>
                <button
                  type="button"
                  onClick={() => handleSelectBook(book)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-emerald-50 dark:bg-emerald-950/30"
                      : "hover:bg-stone-50 dark:hover:bg-stone-800"
                  )}
                >
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      width={40}
                      height={56}
                      className="object-cover rounded shadow-sm flex-shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-14 bg-stone-200 dark:bg-stone-700 rounded flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-stone-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                      {book.title}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
                      {book.author}
                    </p>
                    {book.publishedDate && (
                      <p className="text-xs text-stone-400 dark:text-stone-500">
                        {book.publishedDate.substring(0, 4)}
                      </p>
                    )}
                  </div>
                  {book.averageRating && (
                    <div className="flex items-center gap-1 text-sm text-amber-500 flex-shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {book.averageRating.toFixed(1)}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
