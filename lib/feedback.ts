/**
 * Feedback System
 * Manages when to show feedback dialog (once per session after significant engagement)
 */

const SESSION_KEY = "feedback-shown-session";
const ENGAGEMENT_START_KEY = "engagement-start-time";
const ENGAGEMENT_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Check if feedback has already been shown this session
 */
export function hasFeedbackBeenShown(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

/**
 * Mark feedback as shown for this session
 */
export function markFeedbackShown(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, "1");
}

/**
 * Track engagement time (start tracking on first page load)
 */
export function startEngagementTracking(): void {
  if (typeof window === "undefined") return;
  
  const existing = sessionStorage.getItem(ENGAGEMENT_START_KEY);
  if (!existing) {
    sessionStorage.setItem(ENGAGEMENT_START_KEY, Date.now().toString());
  }
}

/**
 * Check if user has been engaged for 10+ minutes
 */
export function hasEngagedFor10Minutes(): boolean {
  if (typeof window === "undefined") return false;
  
  const startTime = sessionStorage.getItem(ENGAGEMENT_START_KEY);
  if (!startTime) return false;
  
  const elapsed = Date.now() - parseInt(startTime);
  return elapsed >= ENGAGEMENT_THRESHOLD;
}

/**
 * Determine if feedback should be shown
 * Show once per session after:
 * 1. All 4 quizzes completed, OR
 * 2. 10+ minutes of engagement
 */
export function shouldShowFeedback(allQuizzesComplete: boolean): boolean {
  if (typeof window === "undefined") return false;
  
  // Already shown this session?
  if (hasFeedbackBeenShown()) return false;
  
  // All quizzes completed?
  if (allQuizzesComplete) return true;
  
  // 10 minutes of engagement?
  if (hasEngagedFor10Minutes()) return true;
  
  return false;
}

