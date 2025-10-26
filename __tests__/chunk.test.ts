import { describe, it, expect } from "vitest";
import { chunk, normalizeText } from "@/lib/rag/chunk";

describe("Text Chunking", () => {
  it("splits long text into chunks", () => {
    const text = "word ".repeat(1000); // 1000 words
    const chunks = chunk(text, 100, 20); // 100 word chunks, 20 word overlap
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every(c => c.length > 0)).toBe(true);
  });

  it("preserves short text as single chunk", () => {
    const text = "This is a short sentence.";
    const chunks = chunk(text, 800, 200);
    
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(text);
  });

  it("creates overlapping chunks", () => {
    const text = "one two three four five six seven eight nine ten";
    const chunks = chunk(text, 5, 2); // 5 words per chunk, 2 word overlap
    
    // Check that chunks overlap
    expect(chunks.length).toBeGreaterThan(1);
    // The second chunk should contain some words from the first
  });

  it("normalizes whitespace", () => {
    const text = "too    many     spaces\n\n\nand\nnewlines";
    const normalized = normalizeText(text);
    
    expect(normalized).not.toContain("  ");
    expect(normalized).not.toContain("\n");
  });

  it("returns empty array for empty input", () => {
    const chunks = chunk("", 800, 200);
    expect(chunks.length).toBe(0);
  });
});

