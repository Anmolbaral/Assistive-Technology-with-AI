"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getCompletionPercentage,
  LESSON_SLUGS,
  getProgress,
  TRAINING_PROGRESS_EVENT,
} from "@/lib/completion";

function completedCount(): number {
  const progress = getProgress();
  return LESSON_SLUGS.filter((slug) => progress[slug]?.completed && progress[slug]?.quizPassed).length;
}

export function TrainingProgressBadge() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(0);

  const refresh = useCallback(() => {
    setPct(getCompletionPercentage());
    setDone(completedCount());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(TRAINING_PROGRESS_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(TRAINING_PROGRESS_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  if (pct === 0) {
    return (
      <Link
        href="/#training-modules"
        className="hidden sm:inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Training: not started
      </Link>
    );
  }

  return (
    <Link
      href="/#training-modules"
      className="hidden sm:inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Training progress: ${done} of ${LESSON_SLUGS.length} lessons complete, ${pct} percent`}
    >
      Training: {done}/{LESSON_SLUGS.length} ({pct}%)
    </Link>
  );
}
