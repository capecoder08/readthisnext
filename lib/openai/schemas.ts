import { z } from "zod";

// Schema for a single book recommendation
export const BookRecommendationSchema = z.object({
  title: z.string().describe("The book title"),
  author: z.string().describe("The author's full name"),
  description: z
    .string()
    .describe("A compelling 1-2 sentence description of the book"),
  genres: z
    .array(z.string())
    .describe("List of genres (e.g., Mystery, Romance, Sci-Fi)"),
  tropes: z
    .array(z.string())
    .describe("List of tropes (e.g., Enemies to Lovers, Found Family)"),
  matchPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe("How well this book matches the user's preferences (0-100)"),
  matchReason: z
    .string()
    .describe("Brief explanation of why this book matches the user's taste"),
  isTrending: z
    .boolean()
    .describe("Whether this book is currently trending/popular"),
  publicationYear: z
    .number()
    .optional()
    .describe("Year the book was published"),
});

// Schema for the full recommendation response
export const RecommendationResponseSchema = z.object({
  recommendations: z
    .array(BookRecommendationSchema)
    .describe("List of personalized book recommendations"),
  trendingBooks: z
    .array(BookRecommendationSchema)
    .describe("List of currently trending books that match user preferences"),
});

export type BookRecommendation = z.infer<typeof BookRecommendationSchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;

// JSON Schema for OpenAI structured outputs
export const recommendationJsonSchema = {
  name: "book_recommendations",
  strict: true,
  schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        description: "List of personalized book recommendations",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The book title",
            },
            author: {
              type: "string",
              description: "The author's full name",
            },
            description: {
              type: "string",
              description: "A compelling 1-2 sentence description of the book",
            },
            genres: {
              type: "array",
              items: { type: "string" },
              description: "List of genres (e.g., Mystery, Romance, Sci-Fi)",
            },
            tropes: {
              type: "array",
              items: { type: "string" },
              description:
                "List of tropes (e.g., Enemies to Lovers, Found Family)",
            },
            matchPercentage: {
              type: "number",
              description:
                "How well this book matches the user's preferences (0-100)",
            },
            matchReason: {
              type: "string",
              description:
                "Brief explanation of why this book matches the user's taste",
            },
            isTrending: {
              type: "boolean",
              description: "Whether this book is currently trending/popular",
            },
            publicationYear: {
              type: "number",
              description: "Year the book was published",
            },
          },
          required: [
            "title",
            "author",
            "description",
            "genres",
            "tropes",
            "matchPercentage",
            "matchReason",
            "isTrending",
            "publicationYear",
          ],
          additionalProperties: false,
        },
      },
      trendingBooks: {
        type: "array",
        description:
          "List of currently trending books that match user preferences",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The book title",
            },
            author: {
              type: "string",
              description: "The author's full name",
            },
            description: {
              type: "string",
              description: "A compelling 1-2 sentence description of the book",
            },
            genres: {
              type: "array",
              items: { type: "string" },
              description: "List of genres (e.g., Mystery, Romance, Sci-Fi)",
            },
            tropes: {
              type: "array",
              items: { type: "string" },
              description:
                "List of tropes (e.g., Enemies to Lovers, Found Family)",
            },
            matchPercentage: {
              type: "number",
              description:
                "How well this book matches the user's preferences (0-100)",
            },
            matchReason: {
              type: "string",
              description:
                "Brief explanation of why this book matches the user's taste",
            },
            isTrending: {
              type: "boolean",
              description: "Whether this book is currently trending/popular",
            },
            publicationYear: {
              type: "number",
              description: "Year the book was published",
            },
          },
          required: [
            "title",
            "author",
            "description",
            "genres",
            "tropes",
            "matchPercentage",
            "matchReason",
            "isTrending",
            "publicationYear",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["recommendations", "trendingBooks"],
    additionalProperties: false,
  },
};
