import type { GoogleBook } from "@/types";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

interface GoogleBooksVolumeInfo {
  title?: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
}

interface GoogleBooksItem {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBooksItem[];
  totalItems: number;
}

export async function searchGoogleBooks(
  query: string,
  maxResults: number = 8
): Promise<GoogleBook[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      printType: "books",
      orderBy: "relevance",
    });

    const response = await fetch(`${GOOGLE_BOOKS_API}?${params}`);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo.title || "Unknown Title",
      author: item.volumeInfo.authors?.join(", ") || "Unknown Author",
      description: item.volumeInfo.description || undefined,
      coverImage: item.volumeInfo.imageLinks?.thumbnail?.replace(
        "http://",
        "https://"
      ),
      publishedDate: item.volumeInfo.publishedDate,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories,
      averageRating: item.volumeInfo.averageRating,
    }));
  } catch (error) {
    console.error("Failed to search Google Books:", error);
    return [];
  }
}
