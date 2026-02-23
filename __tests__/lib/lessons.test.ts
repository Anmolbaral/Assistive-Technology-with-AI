import { describe, it, expect } from "vitest";
import { lessons, getLessonBySlug, getNextLesson, getPreviousLesson } from "@/lib/lessons";

describe("Lessons", () => {
  describe("lessons array", () => {
    it("contains exactly 4 lessons", () => {
      expect(lessons).toHaveLength(4);
    });

    it("lessons are in ascending order", () => {
      for (let i = 1; i < lessons.length; i++) {
        expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order);
      }
    });

    it("each lesson has a title, slug, duration, and order", () => {
      for (const lesson of lessons) {
        expect(lesson.title.length).toBeGreaterThan(0);
        expect(lesson.slug.length).toBeGreaterThan(0);
        expect(lesson.duration.length).toBeGreaterThan(0);
        expect(lesson.order).toBeGreaterThan(0);
      }
    });

    it("all slugs are unique", () => {
      const slugs = lessons.map((l) => l.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });
  });

  describe("getLessonBySlug", () => {
    it("returns correct lesson for valid slug", () => {
      const lesson = getLessonBySlug("responsible-ai");
      expect(lesson).toBeDefined();
      expect(lesson?.title).toContain("Responsible AI");
      expect(lesson?.order).toBe(1);
    });

    it("returns undefined for invalid slug", () => {
      expect(getLessonBySlug("nonexistent")).toBeUndefined();
    });

    it("returns the SETT framework lesson", () => {
      const lesson = getLessonBySlug("sett-framework");
      expect(lesson?.order).toBe(4);
    });
  });

  describe("getNextLesson", () => {
    it("returns lesson 2 after lesson 1", () => {
      const next = getNextLesson("responsible-ai");
      expect(next?.slug).toBe("prompt-engineering");
    });

    it("returns lesson 3 after lesson 2", () => {
      const next = getNextLesson("prompt-engineering");
      expect(next?.slug).toBe("data-privacy");
    });

    it("returns lesson 4 after lesson 3", () => {
      const next = getNextLesson("data-privacy");
      expect(next?.slug).toBe("sett-framework");
    });

    it("returns undefined after the last lesson", () => {
      expect(getNextLesson("sett-framework")).toBeUndefined();
    });

    it("returns undefined for invalid slug", () => {
      expect(getNextLesson("fake")).toBeUndefined();
    });
  });

  describe("getPreviousLesson", () => {
    it("returns undefined before the first lesson", () => {
      expect(getPreviousLesson("responsible-ai")).toBeUndefined();
    });

    it("returns lesson 1 before lesson 2", () => {
      const prev = getPreviousLesson("prompt-engineering");
      expect(prev?.slug).toBe("responsible-ai");
    });

    it("returns lesson 3 before lesson 4", () => {
      const prev = getPreviousLesson("sett-framework");
      expect(prev?.slug).toBe("data-privacy");
    });

    it("returns undefined for invalid slug", () => {
      expect(getPreviousLesson("fake")).toBeUndefined();
    });
  });
});
