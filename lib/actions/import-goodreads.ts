"use server";

import { createClient } from "@/lib/supabase/server";
import type { GoodreadsBook, ImportResult } from "@/types";

export async function importGoodreadsBooks(
  books: GoodreadsBook[]
): Promise<ImportResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      imported: 0,
      updated: 0,
      failed: books.length,
      errors: ["You must be logged in to import books"],
    };
  }

  let imported = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const book of books) {
    try {
      // Check if book already exists in books table
      const { data: existingBook } = await supabase
        .from("books")
        .select("id")
        .eq("title", book.title)
        .eq("author", book.author)
        .single();

      let bookId: string;

      if (existingBook) {
        bookId = existingBook.id;
      } else {
        // Insert new book
        const { data: newBook, error: insertBookError } = await supabase
          .from("books")
          .insert({
            title: book.title,
            author: book.author,
          })
          .select("id")
          .single();

        if (insertBookError || !newBook) {
          errors.push(`Failed to add book "${book.title}": ${insertBookError?.message}`);
          failed++;
          continue;
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
            status: book.status,
            rating: book.rating,
          })
          .eq("id", existingLibraryEntry.id);

        if (updateError) {
          errors.push(`Failed to update "${book.title}": ${updateError.message}`);
          failed++;
        } else {
          updated++;
        }
      } else {
        // Insert new library entry
        const { error: insertError } = await supabase
          .from("user_library")
          .insert({
            user_id: user.id,
            book_id: bookId,
            status: book.status,
            rating: book.rating,
          });

        if (insertError) {
          errors.push(`Failed to add "${book.title}" to library: ${insertError.message}`);
          failed++;
        } else {
          imported++;
        }
      }
    } catch {
      errors.push(`Unexpected error processing "${book.title}"`);
      failed++;
    }
  }

  return { imported, updated, failed, errors };
}
