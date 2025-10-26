/**
 * Privacy-First Analytics with Plausible
 * All events are anonymized; no PII or raw queries are sent
 */

import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'localhost',
  trackLocalhost: process.env.NODE_ENV === 'development',
});

/**
 * Track custom events
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;
  
  try {
    plausible.trackEvent(eventName, { props });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

/**
 * Track page views (automatically called by Next.js router)
 */
export function trackPageview() {
  if (typeof window === 'undefined') return;
  
  try {
    plausible.trackPageview();
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

/**
 * Hash a string for privacy-preserving event tracking
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Specific event trackers
 */
export const analytics = {
  lessonStarted: (slug: string) => {
    trackEvent('lesson_started', { slug });
  },
  
  lessonCompleted: (slug: string) => {
    trackEvent('lesson_completed', { slug });
  },
  
  quizCompleted: (slug: string, score: number) => {
    trackEvent('quiz_completed', { slug, score });
  },
  
  assistantOpened: () => {
    trackEvent('assistant_opened');
  },
  
  assistantQuery: (queryLength: number) => {
    // Track query length but never the actual content
    trackEvent('assistant_query', { query_length: queryLength });
  },
  
  piiBlocked: (hintCategory?: string) => {
    trackEvent('pii_blocked', { hint: hintCategory || 'general' });
  },
  
  trainingComplete: () => {
    trackEvent('training_complete');
  },
  
  certificateDownloaded: () => {
    trackEvent('certificate_downloaded');
  },
  
  lessonFeedback: (slug: string, helpful: boolean) => {
    trackEvent('lesson_feedback', { slug, helpful });
  },
  
  chatFeedback: (helpful: boolean) => {
    trackEvent('chat_feedback', { helpful });
  },
};

