/**
 * Lesson metadata and utilities
 */

import { LessonSlug } from "./completion";

export interface LessonMetadata {
  title: string;
  slug: LessonSlug;
  duration: string;
  order: number;
}

export const lessons: LessonMetadata[] = [
  {
    title: "Responsible AI in K-12 Education",
    slug: "responsible-ai",
    duration: "5 minutes",
    order: 1,
  },
  {
    title: "Prompt Engineering for AT Resources",
    slug: "prompt-engineering",
    duration: "7 minutes",
    order: 2,
  },
  {
    title: "Student Data Privacy & AI",
    slug: "data-privacy",
    duration: "6 minutes",
    order: 3,
  },
  {
    title: "Using the SETT Framework with AI",
    slug: "sett-framework",
    duration: "7 minutes",
    order: 4,
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

