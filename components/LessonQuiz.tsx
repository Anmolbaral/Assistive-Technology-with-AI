"use client";

import { Quiz, QuizQuestion } from "@/components/Quiz";
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
      // Mark lesson as complete
      markLessonComplete(slug, true);
      
      // Track analytics
      analytics.quizCompleted(slug, score);
      analytics.lessonCompleted(slug);
    }
  };

  return <Quiz questions={questions} onComplete={handleComplete} />;
}

