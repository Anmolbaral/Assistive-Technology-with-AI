# Getting Started with TechBridge Learning AT Training Platform

Welcome! This guide will get you up and running in **under 10 minutes**.

---

## 📋 What You Need

- [ ] Node.js 18+ ([download here](https://nodejs.org))
- [ ] pnpm package manager: `npm install -g pnpm`
- [ ] PostgreSQL database with pgvector (free options below)
- [ ] OpenAI API key ([get one here](https://platform.openai.com/api-keys))

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd assistiveTechnology
pnpm install
```

### 2. Set Up Database

**Option A: Neon (Easiest, Free Tier)**

1. Go to https://neon.tech
2. Create account + new project
3. In SQL Editor, run: `CREATE EXTENSION IF NOT EXISTS vector;`
4. Copy connection string

**Option B: Supabase**

1. Go to https://supabase.com
2. Create project
3. Database → Extensions → Enable `pgvector`
4. Copy connection string

### 3. Configure Environment

```bash
# Create local env file
cp env.template .env.local

# Edit .env.local with your values:
# OPENAI_API_KEY=sk-...
# DATABASE_URL=postgresql://...
```

### 4. Initialize Database & Ingest Content

```bash
# This creates tables and indexes content (~5 minutes)
pnpm tsx scripts/ingest.ts
```

You should see:
```
🚀 Starting ingestion pipeline...
[1/9] Fetching: https://www.joyzabala.com/...
  ✓ Parsed: SETT Framework Resources
  → Chunking into 15 parts
  ✓ Indexed: https://...
...
✅ Ingestion complete in 287.42s
📊 Database Statistics:
  Documents: 9
  Chunks: 158
```

### 5. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000 🎉

---

## 📱 Test the Platform

### Landing Page
- Visit http://localhost:3000
- Click "Start Training"

### Lessons
1. Complete Lesson 1 (Responsible AI) - 5 min
2. Take the quiz (need 80% to pass)
3. Continue through lessons 2-4

### AI Assistant
- Complete all 4 lessons to unlock
- Try query: "What are free text-to-speech tools for Chromebooks for middle school students?"
- Check that you get recommendations with citations

---

## 🧪 Run Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires dev server running)
pnpm test:e2e
```

---

## 📁 Project Structure

```
assistiveTechnology/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── lessons/[slug]/    # Dynamic lesson pages
│   ├── assistant/         # Chat UI
│   ├── complete/          # Completion page
│   └── api/
│       ├── ask/           # RAG endpoint
│       └── health/        # Health check
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── Quiz.tsx          # Interactive quiz
│   ├── DragDrop.tsx      # Drag-and-drop exercise
│   └── Chat.tsx          # Chat interface
├── content/              # MDX lesson files
├── lib/                  # Utilities & business logic
│   ├── rag/             # RAG system (embed, chunk, store, ingest)
│   ├── pii.ts           # PII detection
│   ├── completion.ts    # Progress tracking
│   └── analytics.ts     # Plausible integration
├── scripts/
│   └── ingest.ts        # Content ingestion script
└── docs/
    ├── CURSOR_RULES.md  # Development guidelines
    └── DATABASE_SCHEMA.sql
```

---

## 🎨 Customization

### Brand Colors
Edit `lib/theme.ts`:
```ts
export const brand = {
  colors: {
    primary: "#0C5DBA",  // Change to your color
    // ...
  },
};
```

### Add/Remove Content Sources
Edit `lib/rag/ingest.ts`:
```ts
export const SOURCES = [
  "https://your-site.org/resource-1",
  // Add your URLs here
];
```

Then re-run: `pnpm tsx scripts/ingest.ts`

### Edit Lessons
MDX files in `content/` can be edited directly. Changes appear on page refresh (hot reload).

---

## 🐛 Troubleshooting

### "Module not found: pg"
**Fix:** Ensure API routes have `export const runtime = "nodejs";`

### "Connection timeout" (Database)
**Fix:** Check `DATABASE_URL` includes `?sslmode=require` for Neon/Supabase

### PII detection too strict
**Fix:** Review patterns in `lib/pii.ts` (but bias toward blocking is safer!)

### Build errors with MDX
**Fix:** Check MDX syntax in `content/*.mdx` files

---

## 📚 Key Features Implemented

✅ **4 Interactive Lessons**
- Responsible AI in K-12 Education (5 min)
- Prompt Engineering with SETT (7 min)
- Student Data Privacy & AI (6 min)
- Using SETT Framework with AI (7 min)

✅ **Privacy-First RAG Chatbot**
- PII detection (blocks names, IDs, photos)
- Vector similarity search (pgvector)
- Structured responses with citations
- FERPA/COPPA compliant

✅ **Interactive Components**
- Quizzes (80% passing score required)
- Drag-and-drop exercises
- Prompt writing practice
- Video embeds

✅ **Accessibility**
- Keyboard navigation
- Screen reader support (ARIA labels)
- Focus management
- WCAG 2.1 AA compliant

✅ **Completion Gate**
- localStorage progress tracking
- Unlock AI assistant after training
- Completion badges

✅ **Analytics** (optional)
- Plausible integration
- Privacy-preserving (no cookies)
- Event tracking (lesson starts, completions, queries)

---

## 🚢 Deploy to Production

See `DEPLOYMENT.md` for full instructions. Quick version:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Cost:** ~$5-10/month for 100-500 users

---

## 📖 Documentation

- **README.md** — Overview + architecture
- **DEPLOYMENT.md** — Production deployment guide
- **CURSOR_RULES.md** — Development guidelines (pin in Cursor)
- **docs/DATABASE_SCHEMA.sql** — Database schema + indexes

---

## 🆘 Need Help?

- **Technical Issues:** Check `CURSOR_RULES.md` for common fixes
- **AT Questions:** Contact your AT specialist
- **Bug Reports:** Open GitHub issue

---

## ✅ Next Steps

1. ✅ Complete local setup (you are here!)
2. [ ] Test all 4 lessons
3. [ ] Try the AI assistant
4. [ ] Customize branding (optional)
5. [ ] Deploy to production
6. [ ] Share with colleagues

---

## 🎉 You're All Set!

The platform is ready to use. Educators can now:
- Learn responsible AI practices
- Master privacy-safe prompting
- Get instant AT recommendations
- Access evidence-based resources

**Questions?** See the docs or open an issue.

Happy training! 🚀

