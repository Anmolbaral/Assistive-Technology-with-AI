/**
 * Lesson metadata and utilities
 */

import { LessonSlug } from "./completion";

export interface LessonMetadata {
  title: string;
  slug: LessonSlug;
  duration: string;
  order: number;
  /** One-line preview of activities (knowledge check, interactives, etc.) */
  teaser: string;
}

export const lessons: LessonMetadata[] = [
  {
    title: "Responsible AI in K-12 Education",
    slug: "responsible-ai",
    duration: "5 minutes",
    order: 1,
    teaser:
      "Explore benefits and risks of AI for AT discovery, compare safe vs. unsafe queries, and pass a short knowledge check.",
  },
  {
    title: "Prompt Engineering for AT Resources",
    slug: "prompt-engineering",
    duration: "7 minutes",
    order: 2,
    teaser:
      "Learn the SETT-shaped prompt pattern, upgrade weak prompts with examples, and practice with a knowledge check.",
  },
  {
    title: "Student Data Privacy & AI",
    slug: "data-privacy",
    duration: "6 minutes",
    order: 3,
    teaser:
      "Review what counts as PII, FERPA/COPPA-safe habits, and how TechBridge blocks unsafe queries—then check your understanding.",
  },
  {
    title: "Using the SETT Framework with AI",
    slug: "sett-framework",
    duration: "7 minutes",
    order: 4,
    teaser:
      "Connect SETT steps to real planning, avoid common mistakes, and finish with a final knowledge check before unlocking the assistant.",
  },
];

export function getLessonBySlug(slug: string): LessonMetadata | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getNextLesson(currentSlug: string): LessonMetadata | undefined {
  const current = lessons.find((l) => l.slug === currentSlug);
  if (!current) return undefined;
  return lessons.find((l) => l.order === current.order + 1);
}

export function getPreviousLesson(currentSlug: string): LessonMetadata | undefined {
  const current = lessons.find((l) => l.slug === currentSlug);
  if (!current) return undefined;
  return lessons.find((l) => l.order === current.order - 1);
}
