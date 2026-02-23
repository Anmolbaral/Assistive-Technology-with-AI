import { describe, it, expect } from "vitest";
import { ROLES, type RoleKey } from "@/lib/roles";

describe("Role System", () => {
  const roleKeys: RoleKey[] = ["teacher", "at_specialist", "coach"];

  describe("ROLES configuration", () => {
    it("defines all three roles", () => {
      expect(Object.keys(ROLES)).toHaveLength(3);
      for (const key of roleKeys) {
        expect(ROLES[key]).toBeDefined();
      }
    });

    it.each(roleKeys)("%s has a non-empty label", (key) => {
      expect(ROLES[key].label.length).toBeGreaterThan(0);
    });

    it.each(roleKeys)("%s has a non-empty banner", (key) => {
      expect(ROLES[key].banner.length).toBeGreaterThan(0);
    });

    it.each(roleKeys)("%s has at least 2 sample queries", (key) => {
      expect(ROLES[key].sampleQueries.length).toBeGreaterThanOrEqual(2);
    });

    it.each(roleKeys)("%s has at least 1 resource with title and URL", (key) => {
      expect(ROLES[key].resources.length).toBeGreaterThanOrEqual(1);
      for (const resource of ROLES[key].resources) {
        expect(resource.title.length).toBeGreaterThan(0);
        expect(resource.url).toMatch(/^https?:\/\//);
      }
    });

    it.each(roleKeys)("%s has at least 2 response hints", (key) => {
      expect(ROLES[key].responseHints.length).toBeGreaterThanOrEqual(2);
    });

    it.each(roleKeys)("%s sample queries are all non-empty strings", (key) => {
      for (const q of ROLES[key].sampleQueries) {
        expect(typeof q).toBe("string");
        expect(q.length).toBeGreaterThan(10);
      }
    });
  });

  describe("role labels", () => {
    it("teacher label is 'Teacher'", () => {
      expect(ROLES.teacher.label).toBe("Teacher");
    });

    it("at_specialist label is 'AT Specialist'", () => {
      expect(ROLES.at_specialist.label).toBe("AT Specialist");
    });

    it("coach label is 'Instructional/Technology Coach'", () => {
      expect(ROLES.coach.label).toBe("Instructional/Technology Coach");
    });
  });

  describe("role differentiation", () => {
    it("each role has unique sample queries", () => {
      const allQueries = roleKeys.flatMap((k) => ROLES[k].sampleQueries);
      const unique = new Set(allQueries);
      expect(unique.size).toBe(allQueries.length);
    });

    it("each role has unique banners", () => {
      const banners = roleKeys.map((k) => ROLES[k].banner);
      const unique = new Set(banners);
      expect(unique.size).toBe(banners.length);
    });

    it("each role has unique response hints", () => {
      const allHints = roleKeys.flatMap((k) => ROLES[k].responseHints);
      const unique = new Set(allHints);
      expect(unique.size).toBe(allHints.length);
    });
  });
});
