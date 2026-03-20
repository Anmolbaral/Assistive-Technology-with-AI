/**
 * Integration tests for RAG API quiz completion gate
 * Hits real API endpoints - requires server running (npm run dev or test:integration)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { apiFetch, clearCookieJar } from "./setup";
import { LESSON_SLUGS } from "@/lib/completion";
import { SAFE_EXAMPLES, UNSAFE_EXAMPLES } from "@/lib/pii";

const VALID_QUERY = SAFE_EXAMPLES[0];
const PII_QUERY = UNSAFE_EXAMPLES[0];

describe("RAG API — Quiz Completion Gate", () => {
  beforeEach(() => {
    clearCookieJar();
  });

  it("POST /api/ask without completion returns 403", async () => {
    const res = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query: VALID_QUERY }),
    });

    expect(res.status).toBe(403);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toContain("Complete all 4 training lessons");
  });

  it(
    "POST /api/progress updates state and 4th call sets completion cookie",
    async () => {
    for (const slug of LESSON_SLUGS) {
      const res = await apiFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ slug, quizPassed: true }),
      });
      expect(res.status).toBe(200);
    }

    const askRes = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query: VALID_QUERY }),
    });

    expect(askRes.status).toBe(200);
    const data = (await askRes.json()) as { answer?: string; recommendations?: unknown[] };
    expect(data.answer).toBeDefined();
    expect(data.recommendations).toBeDefined();
  },
    15000
  );

  it(
    "POST /api/ask with completion returns 200 and structured response",
    async () => {
    for (const slug of LESSON_SLUGS) {
      await apiFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ slug, quizPassed: true }),
      });
    }

    const res = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query: VALID_QUERY }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      answer?: string;
      recommendations?: unknown[];
      sources?: unknown[];
      tips?: unknown[];
    };
    expect(data.answer).toBeDefined();
    expect(typeof data.answer).toBe("string");
    expect(data.recommendations).toBeDefined();
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data.sources).toBeDefined();
  },
    15000
  );

  it("POST /api/ask rejects short query with 400", async () => {
    for (const slug of LESSON_SLUGS) {
      await apiFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ slug, quizPassed: true }),
      });
    }

    const res = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query: "hi" }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toBeDefined();
  });

  it("POST /api/ask blocks PII with policy response", async () => {
    for (const slug of LESSON_SLUGS) {
      await apiFetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({ slug, quizPassed: true }),
      });
    }

    const res = await apiFetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query: PII_QUERY }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as { policy?: boolean };
    expect(data.policy).toBe(true);
  });
});
