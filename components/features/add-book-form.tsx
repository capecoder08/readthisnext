"use client";

import { useState } from "react";
import { BookPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addBook } from "@/lib/actions/add-book";
import type { BookStatus } from "@/types";

interface AddBookFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("want_to_read");
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !author.trim()) {
      setError("Title and author are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addBook({
        title: title.trim(),
        author: author.trim(),
        status,
        rating,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setTitle("");
        setAuthor("");
        setStatus("want_to_read");
        setRating(null);
        onSuccess?.();
      }
    } catch {
      setError("Failed to add book. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Book Title *
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Author *
          </label>
          <Input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Reading Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookStatus)}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          >
            <option value="want_to_read">Want to Read</option>
            <option value="reading">Currently Reading</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Your Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? null : star)}
                disabled={isSubmitting}
                className={`p-2 rounded-lg transition-colors ${
                  rating !== null && star <= rating
                    ? "text-amber-500"
                    : "text-stone-300 dark:text-stone-600 hover:text-amber-400"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            {rating && (
              <span className="ml-2 text-sm text-stone-500 dark:text-stone-400 self-center">
                {rating}/5
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <BookPlus className="w-4 h-4 mr-2" />
              Add Book
            </>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
