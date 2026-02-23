import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.hoisted(() => vi.fn());

vi.mock("pg", () => ({
  default: {
    Pool: class {
      query = mockQuery;
    },
  },
}));

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
    it("passes JSON-stringified embedding and limit to the query", async () => {
      const fakeRows = [
        { content: "AT tools for reading", url: "https://example.com", title: "AT Guide", score: 0.95 },
      ];
      mockQuery.mockResolvedValueOnce({ rows: fakeRows });

      const embedding = [0.1, 0.2, 0.3];
      const results = await search(embedding, 5);

      expect(results).toEqual(fakeRows);

      const [queryStr, params] = mockQuery.mock.calls[0];
      expect(queryStr).toContain("ORDER BY");
      expect(queryStr).toContain("<=>"); // vector distance operator
      expect(queryStr).toContain("$1::vector");
      expect(params[0]).toBe(JSON.stringify(embedding));
      expect(params[1]).toBe(5);
    });

    it("defaults to k=8 when not specified", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await search([0.1]);

      const params = mockQuery.mock.calls[0][1];
      expect(params[1]).toBe(8);
    });

    it("throws 'Search failed' on database error", async () => {
      mockQuery.mockRejectedValueOnce(new Error("timeout"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(search([0.1])).rejects.toThrow("Search failed");
      spy.mockRestore();
    });
  });

  describe("searchWithRole", () => {
    it("passes embedding, role, and limit to the role-aware query", async () => {
      const fakeRows = [
        { content: "Teacher AT", url: "https://example.com", title: "Guide", audiences: ["teacher"], rank: 0.05 },
      ];
      mockQuery.mockResolvedValueOnce({ rows: fakeRows });

      const embedding = [0.1, 0.2];
      const results = await searchWithRole(embedding, "teacher", 5);

      // Verify query params: $1=embedding, $2=role, $3=limit
      const [queryStr, params] = mockQuery.mock.calls[0];
      expect(params[0]).toBe(JSON.stringify(embedding));
      expect(params[1]).toBe("teacher");
      expect(params[2]).toBe(5);
      expect(queryStr).toContain("audiences"); // role-aware query references audiences

      // Verify score is computed from rank (1 - rank)
      expect(results).toHaveLength(1);
      expect(results[0].score).toBeCloseTo(1 - 0.05);
      expect(results[0].content).toBe("Teacher AT");
      expect(results[0].url).toBe("https://example.com");
    });

    it("falls back to regular search when role query fails", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockQuery
        .mockRejectedValueOnce(new Error("audiences column missing"))
        .mockResolvedValueOnce({
          rows: [{ content: "Fallback", url: "https://fb.com", title: "FB", score: 0.8 }],
        });

      const results = await searchWithRole([0.1], "coach", 3);

      // First call was the role query (failed), second is the fallback search
      expect(mockQuery).toHaveBeenCalledTimes(2);
      const fallbackParams = mockQuery.mock.calls[1][1];
      expect(fallbackParams[0]).toBe(JSON.stringify([0.1])); // embedding passed to fallback
      expect(fallbackParams[1]).toBe(3); // limit passed through

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("Fallback");
      spy.mockRestore();
    });
  });

  describe("upsertDocument", () => {
    it("passes url, title, and audiences to the insert query", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });

      const id = await upsertDocument("https://example.com", "Test Doc", ["teacher", "coach"]);
      expect(id).toBe(42);

      const params = mockQuery.mock.calls[0][1];
      expect(params[0]).toBe("https://example.com");
      expect(params[1]).toBe("Test Doc");
      expect(params[2]).toEqual(["teacher", "coach"]);
    });

    it("falls back to basic insert (without audiences) when column missing", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockQuery
        .mockRejectedValueOnce(new Error("column audiences does not exist"))
        .mockResolvedValueOnce({ rows: [{ id: 7 }] });

      const id = await upsertDocument("https://example.com", "Test");
      expect(id).toBe(7);

      // Fallback query only passes url and title (no audiences)
      const fallbackParams = mockQuery.mock.calls[1][1];
      expect(fallbackParams).toHaveLength(2);
      expect(fallbackParams[0]).toBe("https://example.com");
      expect(fallbackParams[1]).toBe("Test");
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
