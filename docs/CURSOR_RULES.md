# Cursor Development Rules for TechBridge Learning AT Training Platform

This document provides guidelines for AI-assisted development with Cursor IDE. Pin this file in Cursor for best results.

---

## 🏗️ Architecture Principles

### Edge vs. Node Runtime

- **Edge Routes:** Use for lightweight operations (redirects, middleware)
- **Node Routes:** Required for database operations (pg, pgvector)
- **Rule:** Never import `pg` or Node-only libraries in Edge runtime routes

```ts
// ✅ Good: API route with database access
export const runtime = "nodejs";
import { pool } from "@/lib/rag/store";

// ❌ Bad: Edge route trying to use pg
export const runtime = "edge";
import { pool } from "@/lib/rag/store"; // Will fail!
```

---

## 🔒 Type Safety

### Strict Mode

- **TypeScript:** `"strict": true` in `tsconfig.json`
- **No `any`:** Use proper types or `unknown` + type guards
- **Validation:** All API inputs must be validated with Zod

```ts
// ✅ Good
import { z } from "zod";

const QuerySchema = z.object({
  query: z.string().min(5).max(2000),
});

const { query } = QuerySchema.parse(await req.json());

// ❌ Bad
const body: any = await req.json();
const query = body.query; // No validation!
```

---

## 🎨 UI & Styling

### Component Library

- **Use:** shadcn/ui components + Tailwind utility classes
- **Don't use:** Custom CSS frameworks, inline styles, CSS-in-JS libraries
- **Tokens:** Respect color/spacing tokens in `lib/theme.ts`

```tsx
// ✅ Good
import { Button } from "@/components/ui/button";
<Button variant="primary" size="lg">Click Me</Button>

// ❌ Bad
<button style={{ backgroundColor: "#0C5DBA", padding: "12px" }}>
  Click Me
</button>
```

### Tailwind Conventions

- Use semantic class names: `text-primary`, `bg-muted`, `border-border`
- Avoid magic numbers: Use `gap-4`, `p-6`, not `gap-[17px]`
- Responsive design: Mobile-first with `md:`, `lg:` breakpoints

---

## ♿ Accessibility (a11y)

### Required Practices

- **Keyboard navigation:** All interactive elements must be keyboard-accessible
- **ARIA attributes:** Provide `aria-label`, `aria-describedby`, etc. where needed
- **Focus management:** Visible focus rings (`focus-visible:ring-2`)
- **Semantic HTML:** Use `<button>`, `<nav>`, `<main>`, not `<div onClick>`

```tsx
// ✅ Good
<button
  aria-label="Close dialog"
  className="focus-visible:ring-2 focus-visible:ring-ring"
>
  <XIcon className="h-4 w-4" />
</button>

// ❌ Bad
<div onClick={handleClose}>
  <XIcon />
</div>
```

### Testing a11y

- Use Playwright + `@axe-core/playwright` for automated checks
- Manual keyboard testing (Tab, Enter, Esc)
- Screen reader testing (VoiceOver, NVDA)

---

## 🔐 Privacy & PII Protection

### RAG System Rules

- **Never send PII to LLM:** Run `pii.scan(text)` before calling OpenAI
- **Block unsafe queries:** Return policy message if PII detected
- **Citations required:** Every answer must include 2-6 sources from indexed corpus

```ts
// ✅ Good
if (scan(query)) {
  return NextResponse.json({ 
    policy: true, 
    message: POLICY_MESSAGE 
  });
}

// ❌ Bad
// Sending query directly without PII check
const response = await openai.chat.completions.create({ ... });
```

### PII Examples (Never Accept)

- Student names, IDs, photos
- Parent contact information
- IEP numbers or case identifiers
- Test scores linked to individuals
- Addresses, phone numbers, emails

---

## 📊 JSON Output Schema

### Chat API Response

The `/api/ask` endpoint **must** return this exact schema:

```ts
{
  answer: string;
  recommendations: Array<{
    level: "Low-Tech" | "Mid-Tech" | "High-Tech";
    items: string[];
  }>;
  tips: string[]; // 1-3 items
  sources: Array<{
    title: string;
    url: string;
  }>; // 2-6 items, from corpus only
  disclaimer: string;
}
```

Use `response_format: { type: "json_object" }` and validate with Zod.

---

## 🧪 Testing

### Minimum Requirements

- **Playwright:** Smoke tests for all routes (`/`, `/lessons/*`, `/assistant`)
- **Vitest:** Unit tests for `pii.scan()`, `chunk()`, `store.search()`
- **No broken links:** All MDX lesson links must work

```bash
# Run tests before committing
pnpm test
pnpm test:e2e
```

### Test Coverage Goals

- PII detection: 95%+ accuracy (false negatives not acceptable)
- Chunking: Overlap correctness, no empty chunks
- Vector search: Returns top-K results with valid scores

---

## 🔑 Environment Variables

### Required

- `OPENAI_API_KEY` (OpenAI)
- `DATABASE_URL` (PostgreSQL with pgvector)

### Optional

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (Analytics)
- `RAG_MAX_TOKENS` (default: 800)
- `RAG_MODEL` (default: gpt-4o-mini)
- `EMBED_MODEL` (default: text-embedding-3-large)

### Security Rules

- **Never hardcode keys** in source files
- **Use `.env.local`** for local development (gitignored)
- **Validate presence** at runtime: Throw error if missing critical keys

```ts
// ✅ Good
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

// ❌ Bad
const apiKey = "sk-hardcoded-key"; // NEVER DO THIS
```

---

## 📝 MDX Content

### Component Usage

MDX files can use these components:

- `<Quiz questions={[...]} />`
- `<DragDrop items={[...]} />`
- `<PromptPractice scenario={{...}} />`
- `<InfoCard title="..." icon={Icon}>...</InfoCard>`
- `<Video src="..." caption="..." />`
- `<Objectives items={[...]} />`

### Editing Lessons

1. Edit MDX files in `content/lesson-*.mdx`
2. Test locally: `pnpm dev`
3. No rebuild needed (hot reload works)
4. Redeploy to apply changes in production

---

## 🚨 Common Failure Modes & Fixes

### 1. Edge/Node Runtime Mixup

**Problem:** `pg` imported in Edge route  
**Fix:** Add `export const runtime = "nodejs";` to routes using database

---

### 2. Citations Drifting

**Problem:** LLM invents sources not in corpus  
**Fix:** 
- Pass only top-K results to system prompt
- Include explicit source list in prompt
- Validate `sources` array matches corpus URLs

---

### 3. Token Budget Exceeded

**Problem:** Context too large for LLM  
**Fix:**
- Chunk to ~800 tokens with 200 overlap
- Limit K=8 in vector search
- Use `gpt-4o-mini` (cheaper, faster)

---

### 4. JSON Parsing Errors

**Problem:** LLM returns invalid JSON  
**Fix:**
- Use `response_format: { type: "json_object" }`
- Validate with Zod schema
- Show fallback error card to user

---

### 5. PII False Positives

**Problem:** Safe queries blocked incorrectly  
**Fix:**
- Review regex patterns in `lib/pii.ts`
- Bias toward blocking (better safe than sorry)
- Provide clear edit-and-resubmit UX with hints

---

### 6. Accessibility Issues

**Problem:** DragDrop not keyboard accessible  
**Fix:**
- Use `@dnd-kit/core` with keyboard sensors
- Test with Tab, Enter, Arrow keys
- Add `aria-label` to draggable items

---

## 📦 Dependencies

### Adding Packages

```bash
# ✅ Good: Add with pnpm
pnpm add package-name

# ❌ Bad: Using npm or yarn (inconsistent lock files)
npm install package-name
```

### Version Pinning

- **Exact versions** for critical deps (`openai`, `pg`, `next`)
- **Caret (`^`) versions** for utilities (`clsx`, `lucide-react`)

---

## 🔄 Git Workflow

### Commit Messages

Follow Conventional Commits:

```
feat: add PII detection with regex patterns
fix: resolve Edge runtime error in /api/ask
docs: update CURSOR_RULES with a11y guidelines
```

### Pull Requests

- **Title:** Clear, descriptive
- **Description:** What changed, why, how to test
- **Tests:** Include test coverage for new features
- **Screenshots:** For UI changes

---

## 🎯 Performance

### Optimization Checklist

- [ ] Images optimized (WebP, lazy load)
- [ ] Code splitting (dynamic imports for heavy components)
- [ ] Edge caching for static assets
- [ ] Database indexes on `embedding` column (ivfflat)
- [ ] Limit LLM max tokens (`RAG_MAX_TOKENS=800`)

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [pgvector](https://github.com/pgvector/pgvector)
- [OpenAI API](https://platform.openai.com/docs)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [SETT Framework](https://www.joyzabala.com/sett)

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] TypeScript: No errors (`pnpm tsc --noEmit`)
- [ ] Linting: No errors (`pnpm lint`)
- [ ] Tests: All passing (`pnpm test`)
- [ ] a11y: Keyboard navigation works
- [ ] PII: Detection tested with sample queries
- [ ] Docs: Updated if public APIs changed

---

**Questions?** Consult the main README or open an issue.

