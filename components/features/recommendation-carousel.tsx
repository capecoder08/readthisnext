"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/types";

interface RecommendationCarouselProps {
  title: string;
  subtitle?: string;
  books: Book[];
  icon?: React.ReactNode;
}

function getBookColor(title: string): string {
  const colors = [
    "from-purple-900 to-purple-700",
    "from-emerald-900 to-emerald-700",
    "from-blue-900 to-blue-700",
    "from-rose-900 to-rose-700",
    "from-amber-900 to-amber-700",
    "from-indigo-900 to-indigo-700",
    "from-teal-900 to-teal-700",
    "from-pink-900 to-pink-700",
  ];
  const index = title.charCodeAt(0) % colors.length;
  return colors[index];
}

export function RecommendationCarousel({
  title,
  subtitle,
  books,
  icon,
}: RecommendationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border border-stone-200 dark:border-stone-700 transition-all",
              canScrollLeft
                ? "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                : "opacity-40 cursor-not-allowed text-stone-400"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border border-stone-200 dark:border-stone-700 transition-all",
              canScrollRight
                ? "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                : "opacity-40 cursor-not-allowed text-stone-400"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {books.map((book) => (
          <CarouselCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

function CarouselCard({ book }: { book: Book }) {
  const matchColor =
    book.matchPercentage >= 90
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
      : book.matchPercentage >= 70
        ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
        : "text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800";

  const bookColor = getBookColor(book.title);

  return (
    <div className="flex-shrink-0 w-72 snap-start group cursor-pointer">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
        {/* Book Cover */}
        <div className="relative h-40 overflow-hidden">
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-4",
              bookColor
            )}
          >
            {/* Decorative lines */}
            <div className="absolute top-3 left-3 right-3 h-px bg-white/20" />
            <div className="absolute bottom-3 left-3 right-3 h-px bg-white/20" />

            {/* Title on cover */}
            <h4 className="text-white font-serif text-base font-semibold leading-tight line-clamp-2 text-center">
              {book.title}
            </h4>
            <p className="text-white/70 text-xs mt-1">{book.author}</p>
          </div>

          {/* Match Score Badge */}
          <div className="absolute top-2 right-2">
            <div
              className={cn(
                "rounded-lg px-2 py-1 backdrop-blur-sm",
                matchColor
              )}
            >
              <span className="text-sm font-bold">{book.matchPercentage}%</span>
            </div>
          </div>

          {/* Trending Badge */}
          {book.isTrending && (
            <div className="absolute top-2 left-2">
              <Badge variant="trending" className="text-xs">
                Trending
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 text-sm">
            {book.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {book.author}
          </p>

          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
            {book.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {book.genres.slice(0, 1).map((genre) => (
              <Badge key={genre} variant="default" className="text-xs py-0">
                {genre}
              </Badge>
            ))}
            {book.tropes.slice(0, 1).map((trope) => (
              <Badge key={trope} variant="outline" className="text-xs py-0">
                {trope}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Featured carousel with larger cards
export function FeaturedCarousel({ books }: { books: Book[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Get top matches (90%+)
  const topMatches = books
    .filter((b) => b.matchPercentage >= 85)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  if (topMatches.length === 0) return null;

  return (
    <div className="relative mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Perfect Matches for You
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Based on your reading history and preferences
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border border-stone-200 dark:border-stone-700 transition-all",
              canScrollLeft
                ? "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                : "opacity-40 cursor-not-allowed text-stone-400"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border border-stone-200 dark:border-stone-700 transition-all",
              canScrollRight
                ? "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                : "opacity-40 cursor-not-allowed text-stone-400"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Featured Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {topMatches.map((book) => (
          <FeaturedCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({ book }: { book: Book }) {
  const bookColor = getBookColor(book.title);

  return (
    <div className="flex-shrink-0 w-80 snap-start group cursor-pointer">
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative">
        {/* Glow effect for high matches */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Book Cover */}
        <div className="relative h-48 overflow-hidden">
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-6",
              bookColor
            )}
          >
            {/* Decorative frame */}
            <div className="absolute top-4 left-4 right-4 h-px bg-white/30" />
            <div className="absolute bottom-4 left-4 right-4 h-px bg-white/30" />
            <div className="absolute top-4 bottom-4 left-4 w-px bg-white/30" />
            <div className="absolute top-4 bottom-4 right-4 w-px bg-white/30" />

            <h4 className="text-white font-serif text-xl font-semibold leading-tight line-clamp-2 text-center">
              {book.title}
            </h4>
            <p className="text-white/70 text-sm mt-2">{book.author}</p>
          </div>

          {/* Large Match Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-emerald-500 text-white rounded-xl px-3 py-1.5 shadow-lg">
              <span className="text-lg font-bold">{book.matchPercentage}%</span>
              <span className="text-xs block -mt-0.5">Match</span>
            </div>
          </div>

          {book.isTrending && (
            <div className="absolute top-3 left-3">
              <Badge variant="trending">Trending</Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 relative">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
            {book.title}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {book.author}
          </p>

          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">
            {book.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {book.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="default">
                {genre}
              </Badge>
            ))}
            {book.tropes.slice(0, 2).map((trope) => (
              <Badge key={trope} variant="outline">
                {trope}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
