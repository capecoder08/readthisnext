"use server";

import { createClient } from "@/lib/supabase/server";
import type { BookStatus } from "@/types";

interface AddBookInput {
  title: string;
  author: string;
  status: BookStatus;
  rating: number | null;
}

interface AddBookResult {
  success: boolean;
  error?: string;
  bookId?: string;
}

export async function addBook(input: AddBookInput): Promise<AddBookResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to add books",
    };
  }

  try {
    // Check if book already exists in books table
    const { data: existingBook } = await supabase
      .from("books")
      .select("id")
      .eq("title", input.title)
      .eq("author", input.author)
      .single();

    let bookId: string;

    if (existingBook) {
      bookId = existingBook.id;
    } else {
      // Insert new book
      const { data: newBook, error: insertBookError } = await supabase
        .from("books")
        .insert({
          title: input.title,
          author: input.author,
        })
        .select("id")
        .single();

      if (insertBookError || !newBook) {
        return {
          success: false,
          error: `Failed to add book: ${insertBookError?.message}`,
        };
      }

      bookId = newBook.id;
    }

    // Check if book is already in user's library
    const { data: existingLibraryEntry } = await supabase
      .from("user_library")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .single();

    if (existingLibraryEntry) {
      // Update existing entry
      const { error: updateError } = await supabase
        .from("user_library")
        .update({
          status: input.status,
          rating: input.rating,
        })
        .eq("id", existingLibraryEntry.id);

      if (updateError) {
        return {
          success: false,
          error: `Failed to update book: ${updateError.message}`,
        };
      }
    } else {
      // Insert new library entry
      const { error: insertError } = await supabase
        .from("user_library")
        .insert({
          user_id: user.id,
          book_id: bookId,
          status: input.status,
          rating: input.rating,
        });

      if (insertError) {
        return {
          success: false,
          error: `Failed to add book to library: ${insertError.message}`,
        };
      }
    }

    return { success: true, bookId };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
