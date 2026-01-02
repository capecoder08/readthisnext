"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extractBookFromImage, type OCRBookResult } from "@/lib/actions/ocr-book";
import { addBook } from "@/lib/actions/add-book";
import type { BookStatus } from "@/types";

type UploadState = "idle" | "uploading" | "preview" | "processing" | "result" | "error";

interface BookImageUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookImageUpload({ onSuccess, onCancel }: BookImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRBookResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>("want_to_read");
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);

  const processImage = useCallback(async (base64: string) => {
    setState("processing");
    setError(null);

    const result = await extractBookFromImage(base64);

    if (result.success && result.data) {
      setOcrResult(result.data);
      setState("result");
    } else {
      setError(result.error || "Failed to identify book");
      setState("error");
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        setState("error");
        return;
      }

      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        setState("error");
        return;
      }

      setState("uploading");

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImagePreview(base64);
        setState("preview");

        // Auto-process after preview
        await processImage(base64);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
        setState("error");
      };
      reader.readAsDataURL(file);
    },
    [processImage]
  );

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

  const handleAddToLibrary = async () => {
    if (!ocrResult) return;

    setIsAddingToLibrary(true);

    const result = await addBook({
      title: ocrResult.title,
      author: ocrResult.author,
      status: selectedStatus,
      rating: null,
    });

    setIsAddingToLibrary(false);

    if (result.success) {
      onSuccess?.();
      handleReset();
    } else {
      setError(result.error || "Failed to add book");
    }
  };

  const handleReset = useCallback(() => {
    setState("idle");
    setImagePreview(null);
    setOcrResult(null);
    setError(null);
    setSelectedStatus("want_to_read");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (imagePreview) {
      processImage(imagePreview);
    }
  }, [imagePreview, processImage]);

  return (
    <div className="space-y-4">
      {/* Idle / Upload State */}
      {(state === "idle" || state === "uploading") && (
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
          {state === "uploading" ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-stone-600 dark:text-stone-400">
                Loading image...
              </p>
            </div>
          ) : (
            <>
              <Camera className="w-10 h-10 mx-auto text-stone-400 dark:text-stone-500 mb-3" />
              <p className="text-stone-700 dark:text-stone-300 font-medium mb-1">
                Upload a photo of a book
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Take a picture of the cover or drop an image here
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
      )}

      {/* Preview / Processing State */}
      {(state === "preview" || state === "processing") && imagePreview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Book preview"
              className="w-full max-h-64 object-contain rounded-lg bg-stone-100 dark:bg-stone-800"
            />
            {state === "processing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Identifying book...</p>
                </div>
              </div>
            )}
          </div>
          {state === "preview" && (
            <div className="flex gap-2 justify-center">
              <Button variant="ghost" onClick={handleReset}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Result State */}
      {state === "result" && ocrResult && (
        <div className="space-y-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Book preview"
              className="w-full max-h-48 object-contain rounded-lg bg-stone-100 dark:bg-stone-800"
            />
          )}

          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Book identified!
                </p>
                <p className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-1">
                  {ocrResult.title}
                </p>
                <p className="text-stone-600 dark:text-stone-400">
                  by {ocrResult.author}
                </p>
                {ocrResult.confidence !== "high" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Confidence: {ocrResult.confidence} - Please verify this is correct
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Add to shelf:
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["want_to_read", "reading", "read"] as BookStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      selectedStatus === status
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    )}
                  >
                    {status === "want_to_read"
                      ? "Want to Read"
                      : status === "reading"
                      ? "Currently Reading"
                      : "Read"}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleAddToLibrary}
              disabled={isAddingToLibrary}
            >
              {isAddingToLibrary ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Library"
              )}
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Try Another
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      )}

      {/* Error State */}
      {state === "error" && (
        <div className="space-y-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Book preview"
              className="w-full max-h-48 object-contain rounded-lg bg-stone-100 dark:bg-stone-800"
            />
          )}

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Could not identify book
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {imagePreview && (
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset}>
              Upload Different Image
            </Button>
          </div>
        </div>
      )}

      {/* Cancel button for parent */}
      {state === "idle" && onCancel && (
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
