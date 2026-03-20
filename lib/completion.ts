/**
 * Training Completion Gate
 * Manages localStorage-based progress tracking for lesson completion
 */

export interface LessonProgress {
  slug: string;
  completed: boolean;
  quizPassed: boolean;
  completedAt?: string;
}

export const LESSON_SLUGS = [
  "responsible-ai",
  "prompt-engineering",
  "data-privacy",
  "sett-framework",
] as const;

export type LessonSlug = (typeof LESSON_SLUGS)[number];

/** Current storage keys (TechBridge branding) */
const STORAGE_KEY = "techbridge-training-progress";
const COMPLETION_KEY = "techbridge-training-complete";

/** Legacy keys — read once and migrated to current keys */
const LEGACY_STORAGE_KEY = "aea-training-progress";
const LEGACY_COMPLETION_KEY = "aea-training-complete";

/** Dispatched on same-tab progress updates (localStorage does not fire "storage" in-tab). */
export const TRAINING_PROGRESS_EVENT = "techbridge-progress-changed";

function notifyProgressListeners(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRAINING_PROGRESS_EVENT));
}

/**
 * Copy legacy localStorage into current keys if present (one-way migration).
 */
function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;

  const hasNewProgress = localStorage.getItem(STORAGE_KEY);
  const legacyProgress = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!hasNewProgress && legacyProgress) {
    try {
      JSON.parse(legacyProgress);
      localStorage.setItem(STORAGE_KEY, legacyProgress);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* invalid legacy payload — leave keys; getProgress will ignore */
    }
  }

  const hasNewComplete = localStorage.getItem(COMPLETION_KEY);
  const legacyComplete = localStorage.getItem(LEGACY_COMPLETION_KEY);
  if (!hasNewComplete && legacyComplete === "1") {
    localStorage.setItem(COMPLETION_KEY, "1");
    localStorage.removeItem(LEGACY_COMPLETION_KEY);
  }
}

/**
 * Get all lesson progress
 */
export function getProgress(): Record<string, LessonProgress> {
  if (typeof window === "undefined") return {};

  migrateLegacyIfNeeded();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Mark a lesson as completed
 */
export function markLessonComplete(slug: LessonSlug, quizPassed: boolean = true): void {
  if (typeof window === "undefined") return;

  migrateLegacyIfNeeded();

  const progress = getProgress();
  progress[slug] = {
    slug,
    completed: true,
    quizPassed,
    completedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  checkFullCompletion();
  notifyProgressListeners();
}

/**
 * Check if a specific lesson is complete
 */
export function isLessonComplete(slug: LessonSlug): boolean {
  const progress = getProgress();
  return Boolean(progress[slug]?.completed && progress[slug]?.quizPassed);
}

/**
 * Check if all lessons are complete
 */
function checkFullCompletion(): void {
  const allComplete = LESSON_SLUGS.every((slug) => isLessonComplete(slug));

  if (allComplete) {
    markComplete();
  }
}

/**
 * Mark the entire training as complete
 */
export function markComplete(): void {
  if (typeof window === "undefined") return;
  migrateLegacyIfNeeded();
  localStorage.setItem(COMPLETION_KEY, "1");
  notifyProgressListeners();
}

/**
 * Check if training is complete (gates assistant access)
 */
export function isComplete(): boolean {
  if (typeof window === "undefined") return false;
  migrateLegacyIfNeeded();
  return localStorage.getItem(COMPLETION_KEY) === "1";
}

/**
 * Get completion percentage (0-100)
 */
export function getCompletionPercentage(): number {
  const progress = getProgress();
  const completed = LESSON_SLUGS.filter(
    (slug) => progress[slug]?.completed && progress[slug]?.quizPassed
  ).length;
  return Math.round((completed / LESSON_SLUGS.length) * 100);
}

/**
 * Reset all progress (for testing/debugging)
 */
export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COMPLETION_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem(LEGACY_COMPLETION_KEY);
  notifyProgressListeners();
}
