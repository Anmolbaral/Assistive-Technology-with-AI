// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  hasFeedbackBeenShown,
  markFeedbackShown,
  startEngagementTracking,
  hasEngagedFor10Minutes,
  shouldShowFeedback,
} from "@/lib/feedback";

describe("Feedback System", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("hasFeedbackBeenShown", () => {
    it("returns false when not shown", () => {
      expect(hasFeedbackBeenShown()).toBe(false);
    });

    it("returns true after markFeedbackShown", () => {
      markFeedbackShown();
      expect(hasFeedbackBeenShown()).toBe(true);
    });
  });

  describe("markFeedbackShown", () => {
    it("stores a flag in sessionStorage", () => {
      markFeedbackShown();
      expect(sessionStorage.getItem("feedback-shown-session")).toBe("1");
    });
  });

  describe("startEngagementTracking", () => {
    it("stores a start time in sessionStorage", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      startEngagementTracking();
      const stored = sessionStorage.getItem("engagement-start-time");
      expect(stored).toBe(Date.now().toString());
    });

    it("does not overwrite existing start time", () => {
      sessionStorage.setItem("engagement-start-time", "12345");
      startEngagementTracking();
      expect(sessionStorage.getItem("engagement-start-time")).toBe("12345");
    });
  });

  describe("hasEngagedFor10Minutes", () => {
    it("returns false when no start time", () => {
      expect(hasEngagedFor10Minutes()).toBe(false);
    });

    it("returns false before 10 minutes", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      startEngagementTracking();
      vi.advanceTimersByTime(9 * 60 * 1000); // 9 minutes
      expect(hasEngagedFor10Minutes()).toBe(false);
    });

    it("returns true after 10 minutes", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      startEngagementTracking();
      vi.advanceTimersByTime(10 * 60 * 1000); // exactly 10 minutes
      expect(hasEngagedFor10Minutes()).toBe(true);
    });

    it("returns true well past 10 minutes", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      startEngagementTracking();
      vi.advanceTimersByTime(30 * 60 * 1000); // 30 minutes
      expect(hasEngagedFor10Minutes()).toBe(true);
    });
  });

  describe("shouldShowFeedback", () => {
    it("returns false when already shown", () => {
      markFeedbackShown();
      expect(shouldShowFeedback(true)).toBe(false);
    });

    it("returns true when all quizzes complete and not yet shown", () => {
      expect(shouldShowFeedback(true)).toBe(true);
    });

    it("returns false when quizzes incomplete and not enough engagement", () => {
      startEngagementTracking();
      expect(shouldShowFeedback(false)).toBe(false);
    });

    it("returns true after 10 minutes even without quiz completion", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      startEngagementTracking();
      vi.advanceTimersByTime(11 * 60 * 1000);
      expect(shouldShowFeedback(false)).toBe(true);
    });

    it("returns false after 10 minutes if already shown", () => {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      startEngagementTracking();
      vi.advanceTimersByTime(11 * 60 * 1000);
      markFeedbackShown();
      expect(shouldShowFeedback(false)).toBe(false);
    });
  });
});
