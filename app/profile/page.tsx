"use client";

import { useState, useRef } from "react";
import { Camera, Save, Plus, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockTasteProfile } from "@/lib/mock-data";
import { GoodreadsImport } from "@/components/features/goodreads-import";

const AVAILABLE_GENRES = [
  "Mystery",
  "Sci-Fi",
  "Romance",
  "Fantasy",
  "Non-Fiction",
  "Thriller",
  "Historical Fiction",
  "Horror",
  "Literary Fiction",
  "Young Adult",
  "Biography",
  "Self-Help",
];

const AVAILABLE_TROPES = [
  "Enemies to Lovers",
  "Found Family",
  "Slow Burn",
  "Whodunit",
  "Second Chance",
  "Forbidden Love",
  "Chosen One",
  "Unreliable Narrator",
  "Dual Timeline",
  "Grumpy/Sunshine",
  "Forced Proximity",
  "Secret Identity",
];

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Reader");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);

  // Taste profile state
  const [genres, setGenres] = useState(mockTasteProfile.genres);
  const [tropes, setTropes] = useState(mockTasteProfile.tropes);
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [showTropeSelector, setShowTropeSelector] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    setDisplayName(tempName);
    setIsEditingName(false);
  };

  const handleGenreChange = (genreName: string, newValue: number) => {
    setGenres((prev) =>
      prev.map((g) =>
        g.name === genreName ? { ...g, percentage: newValue } : g
      )
    );
  };

  const addGenre = (genreName: string) => {
    if (!genres.find((g) => g.name === genreName)) {
      setGenres((prev) => [...prev, { name: genreName, percentage: 50 }]);
    }
    setShowGenreSelector(false);
  };

  const removeGenre = (genreName: string) => {
    setGenres((prev) => prev.filter((g) => g.name !== genreName));
  };

  const addTrope = (trope: string) => {
    if (!tropes.includes(trope)) {
      setTropes((prev) => [...prev, trope]);
    }
    setShowTropeSelector(false);
  };

  const removeTrope = (trope: string) => {
    setTropes((prev) => prev.filter((t) => t !== trope));
  };

  const availableGenresToAdd = AVAILABLE_GENRES.filter(
    (g) => !genres.find((genre) => genre.name === g)
  );

  const availableTropesToAdd = AVAILABLE_TROPES.filter(
    (t) => !tropes.includes(t)
  );

  // Check if Romance genre is in the user's preferences
  const hasRomanceGenre = genres.some((g) => g.name === "Romance");

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
            Profile Settings
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Manage your profile and reading preferences
          </p>
        </div>

        {/* Profile Photo & Name */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              Profile Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className={cn(
                    "w-24 h-24 rounded-full overflow-hidden",
                    "bg-stone-200 dark:bg-stone-700",
                    "flex items-center justify-center"
                  )}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-stone-400 dark:text-stone-500" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "absolute bottom-0 right-0",
                    "w-8 h-8 rounded-full",
                    "bg-emerald-600 hover:bg-emerald-700",
                    "flex items-center justify-center",
                    "text-white",
                    "transition-colors"
                  )}
                  aria-label="Upload photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                  Profile Photo
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload New Photo
                </Button>
                {profileImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-600 dark:text-red-400"
                    onClick={() => setProfileImage(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm text-stone-600 dark:text-stone-400 block mb-2">
                Display Name
              </label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                    className="max-w-xs"
                  />
                  <Button variant="primary" size="sm" onClick={handleSaveName}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(false);
                      setTempName(displayName);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-stone-900 dark:text-stone-100">
                    {displayName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Genre Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                Genre Preferences
              </h2>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGenreSelector(!showGenreSelector)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Genre
                </Button>

                {showGenreSelector && availableGenresToAdd.length > 0 && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg p-2 min-w-48">
                    {availableGenresToAdd.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => addGenre(genre)}
                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Adjust the sliders to indicate how much you enjoy each genre.
            </p>

            {genres.map((genre) => (
              <div key={genre.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {genre.name}
                    </span>
                    <button
                      onClick={() => removeGenre(genre.name)}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${genre.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {genre.percentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={genre.percentage}
                  onChange={(e) =>
                    handleGenreChange(genre.name, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            ))}

            {genres.length === 0 && (
              <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
                No genres added yet. Click &quot;Add Genre&quot; to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Import Library */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              Import Library
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              Import your reading history from Goodreads to get personalized recommendations.
            </p>
            <GoodreadsImport />
          </CardContent>
        </Card>

        {/* Favorite Tropes - Only shown if Romance genre is selected */}
        {hasRomanceGenre ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  Favorite Tropes
                </h2>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTropeSelector(!showTropeSelector)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Trope
                  </Button>

                  {showTropeSelector && availableTropesToAdd.length > 0 && (
                    <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg p-2 min-w-48 max-h-64 overflow-y-auto">
                      {availableTropesToAdd.map((trope) => (
                        <button
                          key={trope}
                          onClick={() => addTrope(trope)}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                        >
                          {trope}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                Select the tropes you love to see in your book recommendations.
              </p>

              <div className="flex flex-wrap gap-2">
                {tropes.map((trope) => (
                  <Badge
                    key={trope}
                    variant="default"
                    className="flex items-center gap-1.5 pr-1.5"
                  >
                    {trope}
                    <button
                      onClick={() => removeTrope(trope)}
                      className="hover:text-red-500 transition-colors"
                      aria-label={`Remove ${trope}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {tropes.length === 0 && (
                <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
                  No tropes added yet. Click &quot;Add Trope&quot; to get started.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-stone-500 dark:text-stone-400">
                Add <span className="font-medium text-stone-700 dark:text-stone-300">Romance</span> to your genre preferences to unlock trope settings.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="primary" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
