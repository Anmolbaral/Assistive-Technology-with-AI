"use client";

import { Quiz, QuizQuestion } from "@/components/lessons/Quiz";
import { markLessonComplete, LessonSlug } from "@/lib/completion";
import { analytics } from "@/lib/analytics";
import { usePathname } from "next/navigation";

interface LessonQuizProps {
  questions: QuizQuestion[];
}

export function LessonQuiz({ questions }: LessonQuizProps) {
  const pathname = usePathname();
  
  // Extract slug from pathname (e.g., /lessons/responsible-ai -> responsible-ai)
  const slug = pathname?.split("/").pop() as LessonSlug;

  const handleComplete = (passed: boolean, score: number) => {
    if (passed && slug) {
      // Mark lesson as complete (client-side)
      markLessonComplete(slug, true);

      // Sync progress to server for API gate
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, quizPassed: true }),
        credentials: "include",
      }).catch((err) => console.warn("Progress sync failed:", err));

      // Track analytics
      analytics.quizCompleted(slug, score);
      analytics.lessonCompleted(slug);
    }
  };

  return <Quiz questions={questions} onComplete={handleComplete} />;
}

