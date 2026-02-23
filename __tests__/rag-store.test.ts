import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();

vi.mock("pg", () => {
  return {
    default: {
      Pool: class {
        query = mockQuery;
      },
    },
  };
});

vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

import { sql, search, searchWithRole, upsertDocument, getDocumentCount, getChunkCount } from "@/lib/rag/store";

describe("Vector Store", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("sql tagged template", () => {
    it("builds a parameterized query from a template literal", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const name = "test";
      const rows = await sql`SELECT * FROM docs WHERE name = ${name}`;

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM docs WHERE name = $1",
        ["test"]
      );
      expect(rows).toEqual([{ id: 1 }]);
    });

    it("handles multiple parameters", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await sql`INSERT INTO t (a, b) VALUES (${1}, ${"x"})`;

      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO t (a, b) VALUES ($1, $2)",
        [1, "x"]
      );
    });

    it("propagates database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("connection refused"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(sql`SELECT 1`).rejects.toThrow("connection refused");
      spy.mockRestore();
    });
  });

  describe("search", () => {
    it("returns results from vector similarity query", async () => {
      const fakeRows = [
        { content: "AT tools for reading", url: "https://example.com", title: "AT Guide", score: 0.95 },
      ];
      mockQuery.mockResolvedValueOnce({ rows: fakeRows });

      const results = await search([0.1, 0.2, 0.3], 5);

      expect(results).toEqual(fakeRows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY"),
        [JSON.stringify([0.1, 0.2, 0.3]), 5]
      );
    });

    it("defaults to k=8", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await search([0.1]);

      const args = mockQuery.mock.calls[0][1];
      expect(args[1]).toBe(8);
    });

    it("throws on database error", async () => {
      mockQuery.mockRejectedValueOnce(new Error("timeout"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(search([0.1])).rejects.toThrow("Search failed");
      spy.mockRestore();
    });
  });

  describe("searchWithRole", () => {
    it("performs role-aware search with audience boost", async () => {
      const fakeRows = [
        { content: "Teacher AT", url: "https://example.com", title: "Guide", audiences: ["teacher"], rank: 0.05 },
      ];
      mockQuery.mockResolvedValueOnce({ rows: fakeRows });

      const results = await searchWithRole([0.1], "teacher", 5);

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("Teacher AT");
      expect(typeof results[0].score).toBe("number");
    });

    it("falls back to regular search when role query fails", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockQuery
        .mockRejectedValueOnce(new Error("audiences column missing"))
        .mockResolvedValueOnce({
          rows: [{ content: "Fallback", url: "https://fb.com", title: "FB", score: 0.8 }],
        });

      const results = await searchWithRole([0.1], "coach", 3);

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("Fallback");
      spy.mockRestore();
    });
  });

  describe("upsertDocument", () => {
    it("inserts a document and returns its ID", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });

      const id = await upsertDocument("https://example.com", "Test Doc", ["teacher"]);
      expect(id).toBe(42);
    });

    it("falls back to basic insert if audiences column is missing", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockQuery
        .mockRejectedValueOnce(new Error("column audiences does not exist"))
        .mockResolvedValueOnce({ rows: [{ id: 7 }] });

      const id = await upsertDocument("https://example.com", "Test");
      expect(id).toBe(7);
      expect(mockQuery).toHaveBeenCalledTimes(2);
      spy.mockRestore();
    });
  });

  describe("getDocumentCount", () => {
    it("returns the count of documents", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: "166" }] });
      const count = await getDocumentCount();
      expect(count).toBe(166);
    });
  });

  describe("getChunkCount", () => {
    it("returns the count of chunks", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: "1024" }] });
      const count = await getChunkCount();
      expect(count).toBe(1024);
    });
  });
});
