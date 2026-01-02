"use server";

import { createClient } from "@/lib/supabase/server";
import type { Book, BookStatus } from "@/types";

export interface LibraryBook extends Book {
  status: BookStatus;
  rating: number | null;
  dateAdded: string;
}

export interface LibraryData {
  books: LibraryBook[];
  hasLibrary: boolean;
  counts: {
    total: number;
    reading: number;
    wantToRead: number;
    read: number;
  };
}

export async function getUserLibrary(): Promise<{
  success: boolean;
  data?: LibraryData;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: true,
      data: {
        books: [],
        hasLibrary: false,
        counts: { total: 0, reading: 0, wantToRead: 0, read: 0 },
      },
    };
  }

  try {
    const { data: libraryEntries, error } = await supabase
      .from("user_library")
      .select(
        `
        id,
        status,
        rating,
        created_at,
        books (
          id,
          title,
          author,
          cover_image,
          description,
          genres,
          tropes
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const books: LibraryBook[] = (libraryEntries || [])
      .filter((entry) => entry.books)
      .map((entry) => {
        const book = entry.books as {
          id: string;
          title: string;
          author: string;
          cover_image?: string;
          description?: string;
          genres?: string[];
          tropes?: string[];
        };
        return {
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.cover_image || "",
          description: book.description || "",
          genres: book.genres || [],
          tropes: book.tropes || [],
          matchPercentage: 0,
          status: entry.status as BookStatus,
          rating: entry.rating,
          dateAdded: entry.created_at,
        };
      });

    const counts = {
      total: books.length,
      reading: books.filter((b) => b.status === "reading").length,
      wantToRead: books.filter((b) => b.status === "want_to_read").length,
      read: books.filter((b) => b.status === "read").length,
    };

    return {
      success: true,
      data: {
        books,
        hasLibrary: books.length > 0,
        counts,
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch library",
    };
  }
}
