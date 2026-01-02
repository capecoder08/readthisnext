"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCard } from "./book-card";
import type { Book } from "@/types";

interface RecommendationsProps {
  books: Book[];
  onRefresh?: () => void;
}

export function Recommendations({ books, onRefresh }: RecommendationsProps) {
  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          Top Picks for You
        </h2>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
