import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  className?: string;
}

// Generate a consistent color based on book title
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

export function BookCard({ book, className }: BookCardProps) {
  const matchColor =
    book.matchPercentage >= 90
      ? "text-emerald-600 dark:text-emerald-400"
      : book.matchPercentage >= 70
      ? "text-amber-600 dark:text-amber-400"
      : "text-stone-600 dark:text-stone-400";

  const bookColor = getBookColor(book.title);

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer",
        className
      )}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {/* Gradient background as placeholder cover */}
        <div
          className={cn(
            "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-4",
            bookColor
          )}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 right-4 h-px bg-white/20" />
          <div className="absolute bottom-4 left-4 right-4 h-px bg-white/20" />
          <div className="absolute top-4 bottom-4 left-4 w-px bg-white/20" />
          <div className="absolute top-4 bottom-4 right-4 w-px bg-white/20" />

          {/* Title on cover */}
          <div className="text-center z-10">
            <h4 className="text-white font-serif text-lg font-semibold leading-tight line-clamp-3 mb-2">
              {book.title}
            </h4>
            <p className="text-white/70 text-xs uppercase tracking-wider">
              {book.author}
            </p>
          </div>
        </div>

        {/* Trending Badge */}
        {book.isTrending && (
          <div className="absolute top-2 left-2 z-20">
            <Badge variant="trending" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Trending
            </Badge>
          </div>
        )}

        {/* Match Percentage */}
        <div className="absolute top-2 right-2 z-20">
          <div
            className={cn(
              "bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-lg px-2 py-1",
              matchColor
            )}
          >
            <span className="text-lg font-bold">{book.matchPercentage}%</span>
            <span className="text-xs block -mt-1">Match</span>
          </div>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          {book.author}
        </p>

        {/* Description */}
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
  );
}
