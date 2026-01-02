"use server";

import { openai } from "@/lib/openai/client";
import {
  recommendationJsonSchema,
  RecommendationResponseSchema,
  type RecommendationResponse,
  type BookRecommendation,
} from "@/lib/openai/schemas";
import type { TasteProfile, Book } from "@/types";

interface GetRecommendationsInput {
  tasteProfile: TasteProfile;
  recentlyReadTitles?: string[];
  excludeTitles?: string[];
}

interface GetRecommendationsResult {
  success: boolean;
  data?: {
    recommendations: Book[];
    trendingBooks: Book[];
  };
  error?: string;
}

function buildPrompt(input: GetRecommendationsInput): string {
  const { tasteProfile, recentlyReadTitles = [], excludeTitles = [] } = input;

  // Format genre preferences
  const genrePrefs = tasteProfile.genres
    .sort((a, b) => b.percentage - a.percentage)
    .map((g) => `${g.name} (${g.percentage}% preference)`)
    .join(", ");

  // Format trope preferences
  const tropePrefs =
    tasteProfile.tropes.length > 0
      ? tasteProfile.tropes.join(", ")
      : "No specific trope preferences";

  // Build exclusion list
  const exclusions = [...recentlyReadTitles, ...excludeTitles];
  const exclusionNote =
    exclusions.length > 0
      ? `\n\nDo NOT recommend these books (user has already read or seen them): ${exclusions.join(", ")}`
      : "";

  return `You are a knowledgeable book recommendation expert with deep knowledge of both classic literature and current bestsellers, including books popular on BookTok and Bookstagram.

Generate personalized book recommendations based on the following user preferences:

**Genre Preferences:**
${genrePrefs}

**Favorite Tropes:**
${tropePrefs}
${exclusionNote}

**Instructions:**
1. Provide 8 personalized book recommendations that strongly align with the user's genre and trope preferences
2. Provide 4 currently trending books (popular on BookTok, bestseller lists, or book clubs in 2024-2025) that also match the user's tastes
3. Calculate a realistic matchPercentage (0-100) based on how well each book aligns with the stated preferences
4. Books with higher genre preference percentages should have higher match scores
5. Include a brief, compelling matchReason explaining why the user would enjoy each book
6. For trending books, set isTrending to true
7. Ensure variety - don't recommend multiple books by the same author
8. Include a mix of recent releases (2020+) and modern classics
9. All books must be REAL, published books - do not invent fictional titles

Focus on books that would genuinely appeal to someone with these specific taste preferences.`;
}

function transformToBook(rec: BookRecommendation, index: number): Book {
  return {
    id: `ai-${Date.now()}-${index}`,
    title: rec.title,
    author: rec.author,
    description: rec.description,
    coverImage: "", // Will use gradient fallback
    genres: rec.genres,
    tropes: rec.tropes,
    matchPercentage: Math.round(rec.matchPercentage),
    isTrending: rec.isTrending,
  };
}

export async function getAIRecommendations(
  input: GetRecommendationsInput
): Promise<GetRecommendationsResult> {
  try {
    const prompt = buildPrompt(input);
    console.log(prompt);
    console.log("--------------------------------");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a book recommendation expert. Always respond with real, published books. Be accurate with book details.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: recommendationJsonSchema,
      },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "No response from AI",
      };
    }

    // Parse and validate the response
    const parsed = JSON.parse(content);
    const validated = RecommendationResponseSchema.parse(parsed);

    // Transform to Book type
    const recommendations = validated.recommendations.map((rec, i) =>
      transformToBook(rec, i)
    );
    const trendingBooks = validated.trendingBooks.map((rec, i) =>
      transformToBook({ ...rec, isTrending: true }, i + 100)
    );

    return {
      success: true,
      data: {
        recommendations,
        trendingBooks,
      },
    };
  } catch (error) {
    console.error("Failed to get AI recommendations:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get recommendations",
    };
  }
}

// Get recommendations for a specific book (similar books)
export async function getSimilarBooks(
  book: { title: string; author: string },
  tasteProfile: TasteProfile
): Promise<GetRecommendationsResult> {
  try {
    const genrePrefs = tasteProfile.genres
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map((g) => g.name)
      .join(", ");

    const prompt = `Based on the book "${book.title}" by ${book.author}, recommend 6 similar books that a fan would enjoy.

The user also has these genre preferences: ${genrePrefs}
And enjoys these tropes: ${tasteProfile.tropes.join(", ") || "various"}

Find books with similar themes, writing style, or appeal. Calculate matchPercentage based on similarity to both the source book AND the user's stated preferences.

All books must be REAL, published books.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a book recommendation expert. Always respond with real, published books.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: recommendationJsonSchema,
      },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    const parsed = JSON.parse(content);
    const validated = RecommendationResponseSchema.parse(parsed);

    const recommendations = validated.recommendations.map((rec, i) =>
      transformToBook(rec, i)
    );

    return {
      success: true,
      data: {
        recommendations,
        trendingBooks: [],
      },
    };
  } catch (error) {
    console.error("Failed to get similar books:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get similar books",
    };
  }
}
