# Deployment Guide

This guide walks you through deploying the TechBridge Learning AI & AT Training Platform to production.

---

## Prerequisites

✅ Node.js 18+ and pnpm installed locally  
✅ PostgreSQL database with pgvector extension (Neon or Supabase recommended)  
✅ OpenAI API key  
✅ GitHub account (for Vercel deployment)  
✅ Vercel account (free tier works)

---

## Step 1: Set Up Database

### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. In the SQL Editor, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Copy your connection string (it looks like `postgresql://user:password@host/database`)

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Database → Extensions
3. Enable `pgvector`
4. Copy your connection string from Settings → Database

### Option C: Self-Hosted PostgreSQL

1. Install PostgreSQL 12+ and pgvector:
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # Install pgvector
   git clone https://github.com/pgvector/pgvector.git
   cd pgvector
   make
   sudo make install
   ```

2. Create database and enable extension:
   ```sql
   CREATE DATABASE aea_training;
   \c aea_training
   CREATE EXTENSION vector;
   ```

---

## Step 2: Initialize Database Schema

Run the schema creation script:

```bash
# Using psql
psql $DATABASE_URL -f docs/DATABASE_SCHEMA.sql

# Or manually copy/paste the SQL from docs/DATABASE_SCHEMA.sql
```

---

## Step 3: Ingest Content

Set up your environment variables locally:

```bash
# Create .env.local (not committed to git)
cp env.template .env.local

# Edit .env.local with your credentials
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

Install dependencies and run ingestion:

```bash
pnpm install
pnpm tsx scripts/ingest.ts
```

This will:
- Crawl all source URLs (12 sites)
- Parse content with Readability
- Chunk into ~800 token segments
- Generate embeddings (OpenAI)
- Store in PostgreSQL with pgvector

⏱️ **Estimated time:** 5-10 minutes  
💵 **Estimated cost:** ~$0.50 (OpenAI embeddings)

---

## Step 4: Deploy to Vercel

### Via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/aea-at-training.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click **New Project** → Import your repository

4. Configure environment variables in Vercel:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional)
   - `RAG_MODEL=gpt-4o-mini`
   - `EMBED_MODEL=text-embedding-3-large`

5. Click **Deploy**

### Via Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Follow prompts, then add env vars:
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL

# Deploy to production
vercel --prod
```

---

## Step 5: Verify Deployment

1. Visit your deployed URL (e.g., `https://aea-at-training.vercel.app`)

2. Check health endpoint:
   ```bash
   curl https://your-domain.com/api/health
   ```

   You should see:
   ```json
   {
     "status": "healthy",
     "database": {
       "connected": true,
       "documents": 12,
       "chunks": 150
     }
   }
   ```

3. Test a lesson:
   - Navigate to `/lessons/responsible-ai`
   - Verify MDX content renders
   - Try the quiz

4. Test the assistant (after completing training):
   - Go to `/assistant`
   - Ask: "What are low-tech reading supports for elementary students?"
   - Verify you get a response with citations

---

## Step 6: Set Up Analytics (Optional)

### Plausible

1. Create account at [plausible.io](https://plausible.io)
2. Add your site (e.g., `aea-training.yourschool.org`)
3. Add environment variable in Vercel:
   ```
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=aea-training.yourschool.org
   ```
4. Redeploy

---

## Step 7: Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain (e.g., `ai-training.centralriversaea.org`)
3. Follow DNS instructions to point your domain to Vercel
4. SSL is automatic (via Let's Encrypt)

---

## Maintenance

### Re-index Content

When source URLs change or you add new ones:

```bash
# Update lib/rag/ingest.ts with new URLs
# Then run:
pnpm tsx scripts/ingest.ts
```

You can also trigger this from a Vercel cron job:

```ts
// app/api/cron/reindex/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Run ingestion
  await ingest();
  return Response.json({ success: true });
}
```

### Monitor Health

Set up monitoring (e.g., UptimeRobot, Better Stack) to ping:
- `https://your-domain.com` (every 5 min)
- `https://your-domain.com/api/health` (every 5 min)

### Update Lessons

1. Edit MDX files in `content/`
2. Commit and push to GitHub
3. Vercel auto-deploys changes

### Supabase Free Tier: Prevent Pausing

Supabase pauses free-tier projects after 7 days of inactivity. A GitHub Actions workflow (`.github/workflows/keep-supabase-active.yml`) pings `/api/health` daily to keep the project active.

**Required setup:** Add a repository secret in GitHub:
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `HEALTH_CHECK_URL`
4. Value: your production URL (e.g. `https://your-app.vercel.app`)

You can manually trigger the workflow from the **Actions** tab to test it.

### Database Backups

- **Neon:** Automatic backups (retained 7 days on free tier)
- **Supabase:** Daily backups (point-in-time recovery on paid plans)
- **Self-hosted:** Set up `pg_dump` cron job:
  ```bash
  # Backup script (run daily)
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
  ```

---

## Troubleshooting

### Build Fails on Vercel

**Error:** `Module not found: Can't resolve 'pg'`  
**Fix:** Ensure `/api/ask/route.ts` has `export const runtime = "nodejs";`

---

### Database Connection Errors

**Error:** `Connection timeout` or `SSL required`  
**Fix:** Check that `DATABASE_URL` includes `?sslmode=require` for hosted databases:
```
postgresql://user:pass@host/db?sslmode=require
```

---

### Embeddings Cost Too High

**Solution:** Switch to smaller model:
```bash
# In Vercel environment variables
EMBED_MODEL=text-embedding-3-small
```

Then re-run ingestion. Dimensions will change from 3072 → 1536.

---

### PII Detection Too Strict

**Solution:** Review regex patterns in `lib/pii.ts`. Be cautious—bias toward blocking is safer.

---

## Scaling Considerations

### Traffic Growth

- **100 users/day:** Free tier works fine
- **1,000 users/day:** Upgrade Neon/Supabase to paid tier
- **10,000+ users/day:** Consider dedicated PostgreSQL + connection pooling (PgBouncer)

### Cost Estimates (Monthly)

| Users/Day | Database | OpenAI (Embeddings) | OpenAI (Chat) | Total  |
|-----------|----------|---------------------|---------------|--------|
| 100       | Free     | $0 (one-time)       | ~$5           | ~$5    |
| 1,000     | $20      | $0 (one-time)       | ~$50          | ~$70   |
| 10,000    | $100     | $0 (one-time)       | ~$500         | ~$600  |

*Assumes 2 queries per user; embeddings are one-time cost for ingestion.*

---

## Security Checklist

- [ ] Environment variables set in Vercel (not hardcoded)
- [ ] `.env.local` in `.gitignore` (never committed)
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] No PII in logs or analytics
- [ ] CORS headers configured (if adding API consumers)
- [ ] Rate limiting enabled (via Vercel or middleware)

---

## Support

- **Technical Issues:** Open issue on GitHub
- **AT Questions:** Contact your AT specialist

---

**You're ready to go!** 🎉

Users can now access your AI & AT training at `https://your-domain.com`

