import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("openai", () => {
  const createMock = vi.fn();
  return {
    default: class {
      embeddings = { create: createMock };
    },
    __createMock: createMock,
  };
});

vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

import { embed, getEmbeddingDimension } from "@/lib/rag/embed";
import { __createMock } from "openai";
const createMock = __createMock as ReturnType<typeof vi.fn>;

describe("Embedding Provider", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  describe("embed", () => {
    it("returns a JSON-stringified embedding vector", async () => {
      const fakeVector = [0.1, 0.2, 0.3];
      createMock.mockResolvedValueOnce({
        data: [{ embedding: fakeVector }],
      });

      const result = await embed("test text");
      expect(result).toBe(JSON.stringify(fakeVector));
    });

    it("calls OpenAI with the correct input", async () => {
      createMock.mockResolvedValueOnce({
        data: [{ embedding: [0.1] }],
      });

      await embed("hello world");
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          input: "hello world",
        })
      );
    });

    it("truncates input longer than 8000 characters", async () => {
      const longText = "a".repeat(10000);
      createMock.mockResolvedValueOnce({
        data: [{ embedding: [0.1] }],
      });

      await embed(longText);
      const calledInput = createMock.mock.calls[0][0].input;
      expect(calledInput.length).toBe(8000);
    });

    it("throws on API error", async () => {
      createMock.mockRejectedValueOnce(new Error("API rate limit"));

      await expect(embed("test")).rejects.toThrow("Failed to generate embedding");
    });
  });

  describe("getEmbeddingDimension", () => {
    const originalEnv = process.env.EMBED_MODEL;

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.EMBED_MODEL = originalEnv;
      } else {
        delete process.env.EMBED_MODEL;
      }
    });

    it("returns 3072 for text-embedding-3-large", () => {
      process.env.EMBED_MODEL = "text-embedding-3-large";
      expect(getEmbeddingDimension()).toBe(3072);
    });

    it("returns 1536 for text-embedding-3-small", () => {
      process.env.EMBED_MODEL = "text-embedding-3-small";
      expect(getEmbeddingDimension()).toBe(1536);
    });

    it("defaults to 1536 when EMBED_MODEL is not set", () => {
      delete process.env.EMBED_MODEL;
      expect(getEmbeddingDimension()).toBe(1536);
    });
  });
});
