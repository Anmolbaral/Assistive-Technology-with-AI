# TechBridge Learning – AI Agent Instructions

This file provides context for AI coding agents working on the TechBridge Learning platform. See [README.md](./README.md) for human-oriented documentation.

---

## Project Overview

**TechBridge Learning** is a privacy-first, FERPA-compliant educational platform that trains K-12 educators to use AI responsibly for assistive technology (AT) resource discovery.

- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, PostgreSQL + pgvector, OpenAI
- **UI:** Radix UI via shadcn/ui, MDX for lesson content
- **Package manager:** npm

---

## Dev Environment

### Setup

```bash
npm install
cp env.template .env.local   # Add OPENAI_API_KEY, DATABASE_URL
npm run ingest              # Initialize DB schema + ingest AT documents
npm run dev
```

### Path Aliases

- `@/` resolves to project root (e.g. `@/lib/pii`, `@/components/ui`)

### Key Directories

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages and API routes |
| `components/` | React components (Quiz, Chat, DragDrop, etc.) |
| `content/` | MDX lesson files |
| `lib/` | Utilities, RAG, PII detection, theme |
| `scripts/` | Ingestion and tooling |
| `__tests__/` | Unit tests |

---

## Build & Run Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run ingest` | Re-index RAG documents |

---

## Testing Instructions

- **Unit tests:** Vitest, config in `vitest.config.ts`, setup in `__tests__/setup.ts`
- **E2E tests:** Playwright in `e2e/`
- Run `npm run test` before committing; fix failures before merge
- Add or update tests for any code you change
- Tests live in `__tests__/` mirroring source structure (e.g. `__tests__/lib/pii.test.ts`)

---

## Code Style & Conventions

- **Formatting:** Prettier + ESLint (Next.js config)
- **Components:** Functional components, extract custom hooks for reusable logic
- **Styling:** Tailwind CSS; brand tokens in `lib/theme.ts`
- **Accessibility:** WCAG 2.1 AA; use `lib/a11y.ts` helpers; min touch target 44px

---

## Critical: Privacy & PII

**Never bypass or weaken PII detection.** This platform is FERPA/COPPA compliant.

- PII detection lives in `lib/pii.ts` (regex + compromise NER)
- All chat queries go through `scan()` before RAG/LLM processing
- Do not log, store, or persist student names, IDs, photos, emails, SSNs, etc.
- When adding features that handle user input, ensure PII is blocked or stripped
- Safe query examples: `lib/pii.ts` → `SAFE_EXAMPLES`; unsafe: `UNSAFE_EXAMPLES`

---

## RAG & API

- **RAG pipeline:** `lib/rag/` — embed, chunk, store, ingest, prompt
- **Chat API:** `app/api/ask/route.ts` — validates query, runs PII scan, vector search, LLM
- **Embeddings:** OpenAI `text-embedding-3-large` (3072 dimensions)
- **LLM:** GPT-4o-mini by default; configurable via `RAG_MODEL`
- Re-index after changing `lib/rag/ingest.ts` sources: `npm run ingest`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `DATABASE_URL` | Yes | PostgreSQL connection string (pgvector) |
| `RAG_MODEL` | No | Default: `gpt-4o-mini` |
| `EMBED_MODEL` | No | Default: `text-embedding-3-large` |
| `RAG_MAX_TOKENS` | No | Default: 800 |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Analytics domain |

---

## Deployment

- **Vercel:** Push to GitHub, add env vars, deploy
- **Health check:** `GET /api/health` — used by `keep-supabase-active.yml` cron
- **Post-deploy:** Run ingestion if content sources changed

---

## PR Guidelines

- Run `npm run lint` and `npm run test` before committing
- Ensure accessibility (keyboard nav, screen reader, WCAG)
- Update docs when adding features or changing behavior
- Do not introduce PII collection or logging of student data
