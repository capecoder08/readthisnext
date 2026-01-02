"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseGoodreadsFile } from "@/lib/goodreads/parser";
import { importGoodreadsBooks } from "@/lib/actions/import-goodreads";
import type { GoodreadsBook, ImportResult } from "@/types";

type ImportState = "idle" | "parsing" | "preview" | "importing" | "complete" | "error";

export function GoodreadsImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [parsedBooks, setParsedBooks] = useState<GoodreadsBook[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseErrors(["Please upload a CSV file"]);
      setState("error");
      return;
    }

    setState("parsing");

    try {
      const result = await parseGoodreadsFile(file);

      if (result.errors.length > 0 && result.books.length === 0) {
        setParseErrors(result.errors);
        setState("error");
        return;
      }

      setParsedBooks(result.books);
      setParseErrors(result.errors);
      setSkippedCount(result.skipped);
      setState("preview");
    } catch {
      setParseErrors(["Failed to parse the CSV file"]);
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleImport = useCallback(async () => {
    if (parsedBooks.length === 0) return;

    setState("importing");

    try {
      const result = await importGoodreadsBooks(parsedBooks);
      setImportResult(result);
      setState("complete");
    } catch {
      setParseErrors(["Failed to import books. Please try again."]);
      setState("error");
    }
  }, [parsedBooks]);

  const handleReset = useCallback(() => {
    setState("idle");
    setParsedBooks([]);
    setParseErrors([]);
    setSkippedCount(0);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Idle / Upload State */}
      {(state === "idle" || state === "parsing") && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
              : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600"
          )}
        >
          {state === "parsing" ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-stone-600 dark:text-stone-400">
                Parsing your Goodreads export...
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto text-stone-400 dark:text-stone-500 mb-3" />
              <p className="text-stone-700 dark:text-stone-300 font-medium mb-1">
                Drop your Goodreads export here
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                or click to browse for a CSV file
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Select CSV File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
      )}

      {/* Preview State */}
      {state === "preview" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Ready to import {parsedBooks.length} book{parsedBooks.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  {parsedBooks.filter((b) => b.status === "read").length} read,{" "}
                  {parsedBooks.filter((b) => b.status === "reading").length} currently reading,{" "}
                  {parsedBooks.filter((b) => b.status === "want_to_read").length} want to read
                </p>
                {skippedCount > 0 && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {skippedCount} book{skippedCount !== 1 ? "s" : ""} skipped (unsupported shelf)
                  </p>
                )}
              </div>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {parseErrors.length} warning{parseErrors.length !== 1 ? "s" : ""} during parsing
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="primary" onClick={handleImport}>
              Import Books
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Importing State */}
      {state === "importing" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-stone-600 dark:text-stone-400">
            Importing your books...
          </p>
        </div>
      )}

      {/* Complete State */}
      {state === "complete" && importResult && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Import complete!
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  {importResult.imported} imported, {importResult.updated} updated
                  {importResult.failed > 0 && `, ${importResult.failed} failed`}
                </p>
              </div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                Some issues occurred:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                {importResult.errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {importResult.errors.length > 5 && (
                  <li>...and {importResult.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          <Button variant="outline" onClick={handleReset}>
            Import Another File
          </Button>
        </div>
      )}

      {/* Error State */}
      {state === "error" && (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Import failed
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 mt-1 space-y-1">
                  {parseErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={handleReset}>
            Try Again
          </Button>
        </div>
      )}

      {/* Help Text */}
      {state === "idle" && (
        <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
          Export your library from{" "}
          <a
            href="https://www.goodreads.com/review/import"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            Goodreads
          </a>{" "}
          to get your CSV file
        </p>
      )}
    </div>
  );
}
