import type { GoodreadsBook, BookStatus } from "@/types";

const REQUIRED_COLUMNS = ["Title", "Author", "Exclusive Shelf"];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function mapShelfToStatus(shelf: string): BookStatus | null {
  const shelfLower = shelf.toLowerCase().trim();

  switch (shelfLower) {
    case "read":
      return "read";
    case "currently-reading":
      return "reading";
    case "to-read":
      return "want_to_read";
    default:
      return null;
  }
}

function parseRating(rating: string): number | null {
  const parsed = parseInt(rating, 10);
  if (isNaN(parsed) || parsed === 0) {
    return null;
  }
  return Math.min(Math.max(parsed, 1), 5);
}

export interface ParseResult {
  books: GoodreadsBook[];
  errors: string[];
  skipped: number;
}

export function parseGoodreadsCSV(csvContent: string): ParseResult {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  const errors: string[] = [];
  const books: GoodreadsBook[] = [];
  let skipped = 0;

  if (lines.length === 0) {
    return { books: [], errors: ["CSV file is empty"], skipped: 0 };
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  const columnIndices: Record<string, number> = {};
  headers.forEach((header, index) => {
    columnIndices[header.trim()] = index;
  });

  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => columnIndices[col] === undefined
  );

  if (missingColumns.length > 0) {
    return {
      books: [],
      errors: [`Missing required columns: ${missingColumns.join(", ")}`],
      skipped: 0,
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line);

      const title = values[columnIndices["Title"]]?.trim();
      const author = values[columnIndices["Author"]]?.trim();
      const shelf = values[columnIndices["Exclusive Shelf"]]?.trim();
      const ratingStr = values[columnIndices["My Rating"]]?.trim() || "0";

      if (!title || !author) {
        errors.push(`Row ${i + 1}: Missing title or author`);
        continue;
      }

      const status = mapShelfToStatus(shelf);

      if (!status) {
        skipped++;
        continue;
      }

      const rating = parseRating(ratingStr);

      books.push({
        title,
        author,
        status,
        rating,
      });
    } catch {
      errors.push(`Row ${i + 1}: Failed to parse row`);
    }
  }

  return { books, errors, skipped };
}

export async function parseGoodreadsFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        resolve({ books: [], errors: ["Failed to read file"], skipped: 0 });
        return;
      }
      resolve(parseGoodreadsCSV(content));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}
