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
  'responsible-ai',
  'prompt-engineering',
  'data-privacy',
  'sett-framework',
] as const;

export type LessonSlug = typeof LESSON_SLUGS[number];

const STORAGE_KEY = 'aea-training-progress';
const COMPLETION_KEY = 'aea-training-complete';

/**
 * Get all lesson progress
 */
export function getProgress(): Record<string, LessonProgress> {
  if (typeof window === 'undefined') return {};
  
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
  if (typeof window === 'undefined') return;

  const progress = getProgress();
  progress[slug] = {
    slug,
    completed: true,
    quizPassed,
    completedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  // Check if all lessons are complete
  checkFullCompletion();
}

/**
 * Check if a specific lesson is complete
 */
export function isLessonComplete(slug: LessonSlug): boolean {
  const progress = getProgress();
  return progress[slug]?.completed && progress[slug]?.quizPassed;
}

/**
 * Check if all lessons are complete
 */
function checkFullCompletion(): void {
  const allComplete = LESSON_SLUGS.every(slug => isLessonComplete(slug));
  
  if (allComplete) {
    markComplete();
  }
}

/**
 * Mark the entire training as complete
 */
export function markComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPLETION_KEY, '1');
}

/**
 * Check if training is complete (gates assistant access)
 */
export function isComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COMPLETION_KEY) === '1';
}

/**
 * Get completion percentage (0-100)
 */
export function getCompletionPercentage(): number {
  const progress = getProgress();
  const completed = LESSON_SLUGS.filter(slug => progress[slug]?.completed && progress[slug]?.quizPassed).length;
  return Math.round((completed / LESSON_SLUGS.length) * 100);
}

/**
 * Reset all progress (for testing/debugging)
 */
export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COMPLETION_KEY);
}

