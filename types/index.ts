export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  matchPercentage: number;
  isTrending?: boolean;
  genres: string[];
  tropes: string[];
}

export interface TasteProfile {
  genres: {
    name: string;
    percentage: number;
  }[];
  tropes: string[];
}

export interface ReadingGoal {
  target: number;
  current: number;
  year: number;
}

export interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  tasteProfile: TasteProfile;
  readingGoal: ReadingGoal;
}

export type BookStatus = "want_to_read" | "reading" | "read";

export interface GoodreadsBook {
  title: string;
  author: string;
  status: BookStatus;
  rating: number | null;
}

export interface ImportResult {
  imported: number;
  updated: number;
  failed: number;
  errors: string[];
}

export interface GoogleBook {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
}
