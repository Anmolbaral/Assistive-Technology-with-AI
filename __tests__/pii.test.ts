import { describe, it, expect } from "vitest";
import { scan } from "@/lib/pii";

describe("PII Scanner", () => {
  describe("should block unsafe queries", () => {
    it("detects student names", () => {
      expect(scan("What tools help Johnny Smith with reading?")).toBe(true);
      expect(scan("Student Sarah Jones needs AT support")).toBe(true);
    });

    it("detects IEP numbers", () => {
      expect(scan("Student with IEP #12345 needs help")).toBe(true);
      expect(scan("My student IEP #54321 struggles with writing")).toBe(true);
    });

    it("detects SSN-like patterns", () => {
      expect(scan("Contact 123-45-6789 for student info")).toBe(true);
    });

    it("detects email addresses", () => {
      expect(scan("Contact parent at john.doe@email.com")).toBe(true);
    });

    it("detects phone numbers", () => {
      expect(scan("Parent phone: 555-123-4567")).toBe(true);
    });
  });

  describe("should allow safe queries", () => {
    it("allows general challenge descriptions", () => {
      expect(scan("What AT tools help students with dyslexia?")).toBe(false);
    });

    it("allows environment descriptions", () => {
      expect(scan("Chromebook classroom with 5th graders")).toBe(false);
    });

    it("allows task descriptions", () => {
      expect(scan("Students need to write essays and take notes")).toBe(false);
    });

    it("allows SETT-based queries", () => {
      const query = 
        "What are low-tech and mid-tech AT tools for a 4th-grade student " +
        "with dysgraphia who needs to write essays in a Chromebook classroom?";
      expect(scan(query)).toBe(false);
    });
  });
});

