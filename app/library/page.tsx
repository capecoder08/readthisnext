"use client";

import { useState } from "react";
import { BookOpen, Plus, Upload, X } from "lucide-react";
import { BookCard } from "@/components/features/book-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockBooks } from "@/lib/mock-data";
import { GoodreadsImport } from "@/components/features/goodreads-import";
import { AddBookForm } from "@/components/features/add-book-form";

type Tab = "all" | "reading" | "want_to_read" | "read";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [showImport, setShowImport] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);

  // For demo, we'll use mock books and filter them
  const userBooks = mockBooks.slice(0, 5);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All Books", count: userBooks.length },
    { id: "reading", label: "Currently Reading", count: 2 },
    { id: "want_to_read", label: "Want to Read", count: 2 },
    { id: "read", label: "Read", count: 1 },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-8 md:py-12 px-4 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
                My Library
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowImport(!showImport); setShowAddBook(false); }}>
                <Upload className="h-4 w-4 mr-2" />
                Import from Goodreads
              </Button>
              <Button variant="primary" onClick={() => { setShowAddBook(!showAddBook); setShowImport(false); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>
          </div>

          {/* Add Book Section */}
          {showAddBook && (
            <div className="mb-6 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  Add a Book
                </h2>
                <button
                  onClick={() => setShowAddBook(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AddBookForm
                onSuccess={() => setShowAddBook(false)}
                onCancel={() => setShowAddBook(false)}
              />
            </div>
          )}

          {/* Import Section */}
          {showImport && (
            <div className="mb-6 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                  Import from Goodreads
                </h2>
                <button
                  onClick={() => setShowImport(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <GoodreadsImport />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                {tab.label}
                <Badge variant={activeTab === tab.id ? "success" : "default"}>
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {userBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
              Your library is empty
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Start adding books to track your reading progress
            </p>
            <Button variant="primary" onClick={() => setShowAddBook(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Book
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
