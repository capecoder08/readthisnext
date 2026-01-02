"use client";

import { Target } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ReadingGoal as ReadingGoalType } from "@/types";

interface ReadingGoalProps {
  goal: ReadingGoalType;
  className?: string;
}

export function ReadingGoal({ goal, className }: ReadingGoalProps) {
  const percentage = Math.round((goal.current / goal.target) * 100);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-stone-500" />
          <span className="font-medium text-stone-900 dark:text-stone-100">
            Reading Goal
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
          You&apos;re on track to read {goal.target} books this year!
        </p>

        {/* Big Number */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-stone-900 dark:text-stone-100">
            {goal.current}
          </span>
          <span className="text-stone-500 dark:text-stone-400">
            / {goal.target} books
          </span>
        </div>

        {/* Progress Bar */}
        <Progress value={goal.current} max={goal.target} />

        {/* Percentage */}
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
          {percentage}% complete
        </p>
      </CardContent>
    </Card>
  );
}
