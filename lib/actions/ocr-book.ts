"use server";

import { openai } from "@/lib/openai/client";
import { z } from "zod";

const BookInfoSchema = z.object({
  title: z.string(),
  author: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});

export interface OCRBookResult {
  success: boolean;
  data?: {
    title: string;
    author: string;
    confidence: "high" | "medium" | "low";
  };
  error?: string;
}

export async function extractBookFromImage(
  imageBase64: string
): Promise<OCRBookResult> {
  try {
    // Determine the image type from the base64 header or default to jpeg
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
    if (imageBase64.startsWith("data:image/png")) {
      mediaType = "image/png";
    } else if (imageBase64.startsWith("data:image/gif")) {
      mediaType = "image/gif";
    } else if (imageBase64.startsWith("data:image/webp")) {
      mediaType = "image/webp";
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a book identification expert. Analyze the image and extract the book title and author.

Rules:
- Look for the book title and author name on the cover, spine, or any visible text
- If multiple books are visible, identify the most prominent one
- If you can't clearly identify the book, make your best educated guess based on visible elements
- Set confidence to "high" if title and author are clearly visible
- Set confidence to "medium" if you can make out most of the text but some is unclear
- Set confidence to "low" if you're guessing based on partial information

Respond with JSON in this exact format:
{
  "title": "Book Title",
  "author": "Author Name",
  "confidence": "high" | "medium" | "low"
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What book is shown in this image? Extract the title and author.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "No response from AI",
      };
    }

    const parsed = JSON.parse(content);
    const validated = BookInfoSchema.parse(parsed);

    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    console.error("Failed to extract book from image:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try again.",
    };
  }
}
