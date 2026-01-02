"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Heart, TrendingUp, RefreshCw, Loader2, Upload, Search, Camera } from "lucide-react";
import { SearchBar } from "@/components/features/search-bar";
import { TasteProfile } from "@/components/features/taste-profile";
import { ReadingGoal } from "@/components/features/reading-goal";
import {
  FeaturedCarousel,
  RecommendationCarousel,
} from "@/components/features/recommendation-carousel";
import { GoodreadsImport } from "@/components/features/goodreads-import";
import { BookImageUpload } from "@/components/features/book-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockBooks, mockTasteProfile, mockReadingGoal } from "@/lib/mock-data";
import { getAIRecommendations } from "@/lib/actions/get-recommendations";
import { getUserLibrary, type LibraryData } from "@/lib/actions/get-library";
import type { GoogleBook, Book, TasteProfile as TasteProfileType } from "@/types";

export default function Home() {
  const [recommendations, setRecommendations] = useState<Book[]>(mockBooks);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>(
    mockBooks.filter((b) => b.isTrending)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedAI, setHasLoadedAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryData, setLibraryData] = useState<LibraryData | null>(null);
  const [isCheckingLibrary, setIsCheckingLibrary] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Check if user has a library on mount
  useEffect(() => {
    async function checkLibrary() {
      const result = await getUserLibrary();
      if (result.success && result.data) {
        setLibraryData(result.data);
      }
      setIsCheckingLibrary(false);
    }
    checkLibrary();
  }, []);

  const hasLibrary = libraryData?.hasLibrary ?? false;

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // TODO: Implement search functionality
  };

  const handleBookSelect = (book: GoogleBook) => {
    console.log("Selected book:", book);
    // TODO: Use selected book for recommendations
  };

  const handleImportComplete = () => {
    setShowImport(false);
    // Refresh library data after import
    getUserLibrary().then((result) => {
      if (result.success && result.data) {
        setLibraryData(result.data);
      }
    });
  };

  const fetchRecommendations = useCallback(
    async (profile: TasteProfileType) => {
      setIsLoading(true);
      setError(null);

      try {
        // Include user's library books as context if available
        const recentlyReadTitles = libraryData?.books
          .filter((b) => b.status === "read")
          .slice(0, 10)
          .map((b) => b.title) || [];

        const result = await getAIRecommendations({
          tasteProfile: profile,
          recentlyReadTitles,
        });

        if (result.success && result.data) {
          setRecommendations(result.data.recommendations);
          setTrendingBooks(result.data.trendingBooks);
          setHasLoadedAI(true);
        } else {
          setError(result.error || "Failed to load recommendations");
          // Keep mock data on error
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    },
    [libraryData]
  );

  const handleRefresh = () => {
    fetchRecommendations(mockTasteProfile);
  };

  // Filter recommendations by genre for carousels
  const romanceBooks = recommendations.filter((b) =>
    b.genres.some((g) => g.toLowerCase().includes("romance"))
  );
  const mysteryBooks = recommendations.filter((b) =>
    b.genres.some(
      (g) =>
        g.toLowerCase().includes("mystery") ||
        g.toLowerCase().includes("thriller")
    )
  );
  const sciFiBooks = recommendations.filter((b) =>
    b.genres.some(
      (g) =>
        g.toLowerCase().includes("sci-fi") ||
        g.toLowerCase().includes("science fiction")
    )
  );

  // Show loading state while checking library
  if (isCheckingLibrary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-stone-600 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header - Centered */}
          <div className="text-center mb-10">
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 text-sm border-emerald-300 dark:border-emerald-700"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              AI-POWERED RECOMMENDATIONS
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              Discover books you&apos;ll
              <br />
              <span className="font-serif italic text-emerald-700 dark:text-emerald-400">
                actually love.
              </span>
            </h1>

            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              {hasLibrary
                ? "Based on your reading history, we'll find your perfect next read."
                : "Import your reading history or search for books to get personalized recommendations."}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Taste Profile & Reading Goal (1/3) */}
            <div className="space-y-6">
              <TasteProfile profile={mockTasteProfile} />
              <ReadingGoal goal={mockReadingGoal} />
            </div>

            {/* Right Column - Import & Search (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Import/Photo buttons row */}
              {!showImport && !showPhotoUpload && (
                <div className="flex flex-col justify-center align-items-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
                  <h2 className="text-center text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Build Your Library
                  </h2>
                  <p className="text-center text-sm text-stone-600 dark:text-stone-400 mb-4">
                    {hasLibrary
                      ? `You have ${libraryData?.counts.total} books. Add more to improve recommendations.`
                      : "Get better recommendations by adding books to your library"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => setShowImport(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import from Goodreads
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPhotoUpload(true)}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Snap a Book Cover
                    </Button>
                  </div>
                </div>
              )}

              {/* Goodreads Import Form */}
              {showImport && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                      Import from Goodreads
                    </h2>
                    <button
                      onClick={() => setShowImport(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    >
                      ✕
                    </button>
                  </div>
                  <GoodreadsImport />
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                    <button
                      onClick={handleImportComplete}
                      className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      Done importing? Click here to refresh
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Upload Form */}
              {showPhotoUpload && (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                      Add Book from Photo
                    </h2>
                    <button
                      onClick={() => setShowPhotoUpload(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    >
                      ✕
                    </button>
                  </div>
                  <BookImageUpload
                    onSuccess={() => {
                      setShowPhotoUpload(false);
                      handleImportComplete();
                    }}
                    onCancel={() => setShowPhotoUpload(false)}
                  />
                </div>
              )}

              {/* Search Section */}
              <div className="p-6">
                <div className="flex flex-col justify-center items-center gap-2 mb-4 text-center">
                  <div className="flex flex-row items-center justify-center gap-2 w-full mb-4">
                    <div className="border-b border-stone-200 dark:border-stone-800 w-full"></div>
                    <p className="text-stone-500 dark:text-stone-400">OR</p>
                    <div className="border-b border-stone-200 dark:border-stone-800 w-full"></div>
                  </div>
                  <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                    Already have an idea? Search for a specific book to find similar reads
                  </h2>
                </div>

                <SearchBar onSearch={handleSearch} onBookSelect={handleBookSelect} />
              </div>
            </div>
          </div>

          {/* Get AI Recommendations Button - Centered below columns */}
          <div className="text-center mt-10">
            {!hasLoadedAI && (
              <div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {hasLibrary
                        ? "Get Recommendations Based on Your Library"
                        : "Get Personalized Recommendations"}
                    </>
                  )}
                </Button>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
                  {hasLibrary
                    ? `Powered by AI analyzing your ${libraryData?.counts.total} books`
                    : "Powered by AI based on your taste profile"}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 mt-4">{error}</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Recommendations Carousel */}
      <section className="max-w-7xl mx-auto px-4 py-8 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">
                AI is analyzing your taste profile. This could take a few seconds...
              </p>
            </div>
          </div>
        )}
        <FeaturedCarousel books={recommendations} />
      </section>

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
            <TasteProfile profile={mockTasteProfile} />
            <ReadingGoal goal={mockReadingGoal} />

            {/* Refresh Button */}
            {hasLoadedAI && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Recommendations
              </Button>
            )}
          </aside>

          {/* Main Content - Carousels */}
          <div className="flex-1 space-y-10 overflow-hidden">
            {/* Trending Now */}
            {trendingBooks.length > 0 && (
              <RecommendationCarousel
                title="Trending Now"
                subtitle="Popular picks from BookTok and beyond"
                books={trendingBooks}
                icon={
                  <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                }
              />
            )}

            {/* Because You Love Romance */}
            {romanceBooks.length > 0 && (
              <RecommendationCarousel
                title="Because You Love Romance"
                subtitle="Swoon-worthy picks based on your taste"
                books={romanceBooks}
                icon={
                  <div className="p-2 bg-pink-100 dark:bg-pink-950/50 rounded-lg">
                    <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                }
              />
            )}

            {/* Mystery & Thriller */}
            {mysteryBooks.length > 0 && (
              <RecommendationCarousel
                title="Mystery & Thriller"
                subtitle="Page-turners you won't put down"
                books={mysteryBooks}
                icon={
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                }
              />
            )}

            {/* Sci-Fi */}
            {sciFiBooks.length > 0 && (
              <RecommendationCarousel
                title="Sci-Fi & Fantasy"
                subtitle="Worlds beyond imagination"
                books={sciFiBooks}
                icon={
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                }
              />
            )}

            {/* All Recommendations */}
            <RecommendationCarousel
              title="All Recommendations"
              subtitle="Curated picks based on your preferences"
              books={recommendations}
              icon={
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
