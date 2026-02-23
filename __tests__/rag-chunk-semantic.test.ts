import { describe, it, expect } from "vitest";
import { semanticChunk, normalizeText, chunk } from "@/lib/rag/chunk";

describe("Semantic Chunking", () => {
  describe("semanticChunk", () => {
    it("returns single chunk for short text", () => {
      const text = "This is a short paragraph.";
      const result = semanticChunk(text, 3000);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(text);
    });

    it("splits on paragraph boundaries", () => {
      const para1 = "A".repeat(2000);
      const para2 = "B".repeat(2000);
      const text = `${para1}\n\n${para2}`;
      const result = semanticChunk(text, 3000);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(para1);
      expect(result[1]).toBe(para2);
    });

    it("merges small paragraphs into one chunk", () => {
      const text = "Short para 1.\n\nShort para 2.\n\nShort para 3.";
      const result = semanticChunk(text, 3000);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("Short para 1.");
      expect(result[0]).toContain("Short para 3.");
    });

    it("handles empty paragraphs between content", () => {
      const text = "First.\n\n\n\n\nSecond.";
      const result = semanticChunk(text, 3000);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("First.");
      expect(result[0]).toContain("Second.");
    });

    it("returns original text as fallback for empty input", () => {
      const result = semanticChunk("", 3000);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("");
    });

    it("handles text with only whitespace paragraphs", () => {
      const result = semanticChunk("   \n\n   \n\n   ", 3000);
      expect(result).toHaveLength(1);
    });

    it("preserves paragraph separation in output", () => {
      const text = "Para one content.\n\nPara two content.";
      const result = semanticChunk(text, 10000);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("\n\n");
    });

    it("creates multiple chunks for a long multi-paragraph document", () => {
      const paragraphs = Array.from({ length: 20 }, (_, i) => `Paragraph ${i}: ${"x".repeat(500)}`);
      const text = paragraphs.join("\n\n");
      const result = semanticChunk(text, 2000);
      expect(result.length).toBeGreaterThan(1);
      expect(result.every((c) => c.length > 0)).toBe(true);
    });
  });

  describe("normalizeText edge cases", () => {
    it("removes control characters", () => {
      const text = "Hello\x00World\x1FEnd";
      const result = normalizeText(text);
      expect(result).not.toContain("\x00");
      expect(result).not.toContain("\x1F");
      expect(result).toBe("HelloWorldEnd");
    });

    it("collapses tabs and mixed whitespace", () => {
      expect(normalizeText("a\t\t  b")).toBe("a b");
    });

    it("trims leading and trailing whitespace", () => {
      expect(normalizeText("  hello  ")).toBe("hello");
    });

    it("handles empty string", () => {
      expect(normalizeText("")).toBe("");
    });
  });

  describe("chunk edge cases", () => {
    it("handles single-word input", () => {
      const result = chunk("hello", 800, 200);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("hello");
    });

    it("handles text exactly at target size", () => {
      const words = Array.from({ length: 800 }, (_, i) => `word${i}`);
      const result = chunk(words.join(" "), 800, 200);
      expect(result).toHaveLength(1);
    });

    it("handles text just over target size", () => {
      const words = Array.from({ length: 801 }, (_, i) => `word${i}`);
      const result = chunk(words.join(" "), 800, 200);
      expect(result.length).toBeGreaterThan(1);
    });

    it("handles special characters in text", () => {
      const text = "Hello! @#$% ^&*() world? Yes. No—maybe. café résumé";
      const result = chunk(text, 800, 200);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain("café");
    });
  });
});
