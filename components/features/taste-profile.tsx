"use client";

import { RefreshCw } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TasteProfile as TasteProfileType } from "@/types";

interface TasteProfileProps {
  profile: TasteProfileType;
  className?: string;
}

export function TasteProfile({ profile, className }: TasteProfileProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-stone-500" />
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Your Taste Profile
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Genre Preferences */}
        <div className="space-y-3">
          {profile.genres.map((genre) => (
            <div key={genre.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">
                  {genre.name}
                </span>
                <span className="text-stone-500 dark:text-stone-500">
                  {genre.percentage}%
                </span>
              </div>
              <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${genre.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tropes */}
        <div className="pt-2">
          <div className="flex flex-wrap gap-2">
            {profile.tropes.map((trope) => (
              <Badge key={trope} variant="outline">
                {trope}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
