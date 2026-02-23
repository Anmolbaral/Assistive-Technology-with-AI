// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  getProgress,
  markLessonComplete,
  isLessonComplete,
  isComplete,
  markComplete,
  getCompletionPercentage,
  resetProgress,
  LESSON_SLUGS,
} from "@/lib/completion";

describe("Completion & Progress Tracking", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getProgress", () => {
    it("returns empty object when no progress stored", () => {
      expect(getProgress()).toEqual({});
    });

    it("returns stored progress", () => {
      const data = { "responsible-ai": { slug: "responsible-ai", completed: true, quizPassed: true } };
      localStorage.setItem("aea-training-progress", JSON.stringify(data));
      expect(getProgress()).toEqual(data);
    });

    it("returns empty object for corrupted JSON", () => {
      localStorage.setItem("aea-training-progress", "not-json{{{");
      expect(getProgress()).toEqual({});
    });
  });

  describe("markLessonComplete", () => {
    it("marks a lesson as completed with quiz passed", () => {
      markLessonComplete("responsible-ai", true);
      const progress = getProgress();
      expect(progress["responsible-ai"].completed).toBe(true);
      expect(progress["responsible-ai"].quizPassed).toBe(true);
      expect(progress["responsible-ai"].completedAt).toBeDefined();
    });

    it("marks a lesson with quizPassed=false", () => {
      markLessonComplete("prompt-engineering", false);
      const progress = getProgress();
      expect(progress["prompt-engineering"].completed).toBe(true);
      expect(progress["prompt-engineering"].quizPassed).toBe(false);
    });

    it("preserves progress from other lessons", () => {
      markLessonComplete("responsible-ai");
      markLessonComplete("prompt-engineering");
      const progress = getProgress();
      expect(progress["responsible-ai"]).toBeDefined();
      expect(progress["prompt-engineering"]).toBeDefined();
    });

    it("sets training complete when all lessons are done", () => {
      for (const slug of LESSON_SLUGS) {
        markLessonComplete(slug, true);
      }
      expect(isComplete()).toBe(true);
    });

    it("does not set training complete when only some lessons are done", () => {
      markLessonComplete("responsible-ai");
      markLessonComplete("prompt-engineering");
      expect(isComplete()).toBe(false);
    });
  });

  describe("isLessonComplete", () => {
    it("returns false for incomplete lesson", () => {
      expect(isLessonComplete("responsible-ai")).toBeFalsy();
    });

    it("returns true for completed lesson with quiz passed", () => {
      markLessonComplete("responsible-ai", true);
      expect(isLessonComplete("responsible-ai")).toBeTruthy();
    });

    it("returns false when completed but quiz not passed", () => {
      markLessonComplete("data-privacy", false);
      expect(isLessonComplete("data-privacy")).toBeFalsy();
    });
  });

  describe("isComplete / markComplete", () => {
    it("returns false when training not complete", () => {
      expect(isComplete()).toBe(false);
    });

    it("returns true after markComplete", () => {
      markComplete();
      expect(isComplete()).toBe(true);
    });
  });

  describe("getCompletionPercentage", () => {
    it("returns 0 with no progress", () => {
      expect(getCompletionPercentage()).toBe(0);
    });

    it("returns 25 after one lesson", () => {
      markLessonComplete("responsible-ai");
      expect(getCompletionPercentage()).toBe(25);
    });

    it("returns 50 after two lessons", () => {
      markLessonComplete("responsible-ai");
      markLessonComplete("prompt-engineering");
      expect(getCompletionPercentage()).toBe(50);
    });

    it("returns 75 after three lessons", () => {
      markLessonComplete("responsible-ai");
      markLessonComplete("prompt-engineering");
      markLessonComplete("data-privacy");
      expect(getCompletionPercentage()).toBe(75);
    });

    it("returns 100 after all lessons", () => {
      for (const slug of LESSON_SLUGS) {
        markLessonComplete(slug);
      }
      expect(getCompletionPercentage()).toBe(100);
    });

    it("does not count lessons where quiz was not passed", () => {
      markLessonComplete("responsible-ai", true);
      markLessonComplete("prompt-engineering", false);
      expect(getCompletionPercentage()).toBe(25);
    });
  });

  describe("resetProgress", () => {
    it("clears all progress", () => {
      markLessonComplete("responsible-ai");
      markComplete();
      resetProgress();
      expect(getProgress()).toEqual({});
      expect(isComplete()).toBe(false);
    });
  });

  describe("LESSON_SLUGS", () => {
    it("contains exactly 4 lessons", () => {
      expect(LESSON_SLUGS).toHaveLength(4);
    });

    it("has the expected slugs", () => {
      expect(LESSON_SLUGS).toContain("responsible-ai");
      expect(LESSON_SLUGS).toContain("prompt-engineering");
      expect(LESSON_SLUGS).toContain("data-privacy");
      expect(LESSON_SLUGS).toContain("sett-framework");
    });
  });
});
