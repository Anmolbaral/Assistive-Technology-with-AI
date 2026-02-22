# TechBridge Learning - AI & AT Training Platform

A **privacy-first**, **FERPA-compliant** educational platform that trains K-12 educators to use AI responsibly for assistive technology (AT) resource discovery. Built with Next.js, PostgreSQL + pgvector, and OpenAI.

---

## ✨ Features

- **4 Interactive Lessons** (20-25 min total)
  - Responsible AI in K-12 Education
  - Prompt Engineering with the SETT Framework
  - Student Data Privacy & AI (FERPA/COPPA)
  - Using SETT with AI for AT Decision-Making

- **Privacy-First RAG Chatbot**
  - PII detection blocks unsafe queries
  - Vector search over curated AT resources
  - Structured responses with citations
  - No student data collected or stored

- **Accessible UI**
  - Keyboard navigation
  - Screen reader support
  - WCAG 2.1 AA compliant
  - Responsive design

- **Completion Gate**
  - Pass all quizzes to unlock AI assistant
  - localStorage-based progress tracking

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database with pgvector extension (Neon or Supabase recommended)
- OpenAI API key

### Installation

```bash
# 1. Clone or create the project
cd assistiveTechnology

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp env.template .env.local

# 4. Add your credentials to .env
# - OPENAI_API_KEY
# - DATABASE_URL (PostgreSQL with pgvector)

# 5. Initialize database schema and ingest documents
pnpm tsx scripts/ingest.ts

# 6. Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
assistiveTechnology/
├── app/
│   ├── layout.tsx                # Root layout + header/footer
│   ├── page.tsx                  # Landing page
│   ├── lessons/[slug]/page.tsx   # Dynamic lesson pages
│   ├── complete/page.tsx         # Completion page
│   ├── assistant/page.tsx        # Chat UI (gated by completion)
│   └── api/
│       ├── ask/route.ts          # RAG endpoint
│       └── health/route.ts       # Health check
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── Quiz.tsx                  # Interactive quiz
│   ├── DragDrop.tsx              # Drag-and-drop exercise
│   ├── PromptPractice.tsx        # Prompt writing practice
│   ├── InfoCard.tsx, Video.tsx   # Content components
│   └── Chat.tsx                  # Chat interface
├── content/
│   ├── lesson-1.mdx              # Responsible AI
│   ├── lesson-2.mdx              # Prompt Engineering
│   ├── lesson-3.mdx              # Data Privacy
│   └── lesson-4.mdx              # SETT Framework
├── lib/
│   ├── theme.ts                  # Brand colors
│   ├── a11y.ts                   # Accessibility helpers
│   ├── completion.ts             # Progress tracking
│   ├── pii.ts                    # PII detection
│   ├── analytics.ts              # Plausible integration
│   ├── mdx.tsx                   # MDX component mapping
│   └── rag/
│       ├── embed.ts              # OpenAI embeddings
│       ├── chunk.ts              # Text chunking
│       ├── store.ts              # pgvector queries
│       ├── ingest.ts             # Crawl & index pipeline
│       └── prompt.ts             # System prompts & schema
├── scripts/
│   └── ingest.ts                 # Ingestion runner
└── styles/
    └── globals.css               # Tailwind + custom styles
```

---

## 🗄️ Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE chunks (
  id BIGSERIAL PRIMARY KEY,
  doc_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT,
  content TEXT,
  embedding vector(3072)  -- text-embedding-3-large
);

CREATE INDEX idx_chunks_embedding ON chunks USING ivfflat (embedding vector_l2_ops);
CREATE INDEX idx_chunks_doc ON chunks(doc_id);
```

---

## 🔐 Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Database (Neon, Supabase, or local PostgreSQL with pgvector)
DATABASE_URL=postgresql://user:password@host:5432/database

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=techbridge-learning.example.com

# RAG Configuration
RAG_MAX_TOKENS=800
RAG_MODEL=gpt-4o-mini
EMBED_MODEL=text-embedding-3-large
```

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests (Playwright)
pnpm test:e2e
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

1. Set up PostgreSQL with pgvector on Neon or Supabase
2. Run ingestion script: `pnpm tsx scripts/ingest.ts`
3. Build: `pnpm build`
4. Start: `pnpm start`

---

## 🎨 Customization

### Branding

Edit `lib/theme.ts` to change colors and styles:

```ts
export const brand = {
  colors: {
    primary: "#0C5DBA",  // Your brand color
    // ...
  },
};
```

### Content Sources

Add/remove URLs in `lib/rag/ingest.ts`:

```ts
export const SOURCES = [
  "https://yoursite.org/at-resources",
  // ...
];
```

Then re-run: `pnpm tsx scripts/ingest.ts`

---

## 📚 Key Technologies

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components:** Radix UI (via shadcn/ui)
- **Content:** MDX with next-mdx-remote
- **Database:** PostgreSQL + pgvector
- **Embeddings:** OpenAI text-embedding-3-large
- **LLM:** OpenAI GPT-4o-mini
- **Analytics:** Plausible (privacy-preserving)
- **Deployment:** Vercel

---

## 🛡️ Privacy & Security

- **No PII Collection:** Student names, IDs, photos are blocked at the query level
- **Ephemeral Queries:** Conversations are not logged or stored
- **FERPA/COPPA Compliant:** Designed for K-12 educational use
- **Transparent Citations:** Every response includes source links
- **Open Source (Internal):** Code can be audited by your IT team

---

## 📖 Usage

1. **Complete Training** (20-25 min)
   - Take 4 interactive lessons
   - Pass quizzes with 80%+ accuracy
   - Unlock AI assistant

2. **Use the Assistant**
   - Write privacy-safe queries using SETT Framework
   - Get recommendations by tech level (Low/Mid/High)
   - Review sources and tips
   - Consult AT specialist for trials

3. **Example Query**
   ```
   What are free text-to-speech tools for Chromebooks that help 
   middle school students with reading comprehension during 
   independent work?
   ```

---

## 🤝 Contributing

Internal contributions welcome! Please:

1. Follow existing code style (Prettier + ESLint)
2. Add tests for new features
3. Update documentation
4. Ensure accessibility (a11y) compliance

---

## 📄 License

© 2025 TechBridge Learning. All rights reserved.

This software is intended for educational use by schools and educators.

---

## 🆘 Support

- **Technical Issues:** Contact your IT department
- **AT Questions:** Contact your AT specialist
- **Training Support:** See the in-app lessons

---

## 🔄 Maintenance

### Re-index Content

When source URLs are updated:

```bash
pnpm tsx scripts/ingest.ts
```

### Update Lessons

Edit MDX files in `content/` and redeploy.

### Monitor Health

```bash
curl https://your-domain.com/api/health
```

---

## 🎯 Roadmap

- [ ] User accounts (Clerk) for named certificates
- [ ] Admin dashboard for content management
- [ ] Re-ranker for improved search relevance
- [ ] Export "trial plan" templates
- [ ] Offline PWA support
- [ ] i18n (Spanish)

---

**Built with ❤️ for K-12 educators by TechBridge Learning**

