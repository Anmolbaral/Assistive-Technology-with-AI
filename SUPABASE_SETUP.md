# Supabase Backend Setup Guide

This guide will help you migrate your TechBridge Learning platform backend to Supabase, including database, secrets, and API configuration.

## 🚀 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **GitHub Repository**: Your code is already at `git@github.com:Anmolbaral/Assistive-Technology-with-AI.git`
3. **Environment Variables**: Current setup with PostgreSQL

## 📋 Step 1: Create Supabase Project

### 1.1 Create New Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `TechBridge Learning AT Platform`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier

### 1.2 Get Project Credentials
After creation, go to **Settings > API** and note:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🗄️ Step 2: Database Setup

### 2.1 Enable pgvector Extension
1. Go to **SQL Editor** in Supabase dashboard
2. Run this query:
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2.2 Create Database Schema
Run this complete schema in **SQL Editor**:

```sql
-- Create documents table with pgvector support
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Metadata
  category TEXT,
  last_modified TIMESTAMP WITH TIME ZONE,
  content_hash TEXT,
  
  -- Role-based audience tagging
  audiences text[] DEFAULT ARRAY['general']
);

-- Create chunks table for vector embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id BIGSERIAL PRIMARY KEY,
  doc_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_url ON documents(url);
CREATE INDEX IF NOT EXISTS idx_documents_audiences ON documents USING GIN(audiences);
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);

-- Add comments for documentation
COMMENT ON TABLE documents IS 'Source documents for RAG system';
COMMENT ON TABLE chunks IS 'Text chunks with vector embeddings for semantic search';
COMMENT ON COLUMN documents.audiences IS 'Array of role tags (teacher, at_specialist, coach, general) for persona-aware retrieval';
COMMENT ON COLUMN chunks.embedding IS 'OpenAI ada-002 embeddings (1536 dimensions)';
```

### 2.3 Verify Schema
Run this query to verify everything is set up correctly:
```sql
-- Check tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('documents', 'chunks');

-- Check pgvector extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename IN ('documents', 'chunks');
```

## 🔐 Step 3: Environment Variables Setup

### 3.1 Supabase Environment Variables
Create a `.env.local` file with these Supabase variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL for direct connection (optional)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# OpenAI API (keep your existing key)
OPENAI_API_KEY=sk-...

# RAG Configuration
RAG_MODEL=gpt-4o-mini
RAG_MAX_TOKENS=2000

# Analytics (optional)
PLAUSIBLE_DOMAIN=your-domain.com
```

### 3.2 Update Database Connection
Update your `lib/rag/store.ts` to use Supabase:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Replace your existing pool connection with Supabase client
export async function searchWithRole(
  queryEmbedding: number[],
  role: string,
  k: number = 8
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('search_with_role', {
    query_embedding: queryEmbedding,
    role_filter: role,
    match_count: k
  })
  
  if (error) throw error
  return data || []
}
```

## 📊 Step 4: Data Migration

### 4.1 Install Supabase CLI (Optional but Recommended)
```bash
npm install -g supabase
```

### 4.2 Create Migration Script
Create `scripts/migrate-to-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { embed } from '../lib/rag/embed'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateData() {
  console.log('Starting data migration to Supabase...')
  
  // Your existing data sources
  const sources = [
    'https://www.edutopia.org/article/free-assistive-tech-tools-support-academic-success/',
    'https://www.teachingchannel.com/k12-hub/blog/assistive-technology-tools-for-your-classroom/',
    // Add all your sources here
  ]
  
  for (const url of sources) {
    try {
      console.log(`Processing: ${url}`)
      
      // Fetch and parse content (use your existing logic)
      const { title, content } = await fetchAndParse(url)
      
      // Insert document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          url,
          title,
          audiences: inferAudiences(url)
        })
        .select()
        .single()
      
      if (docError) throw docError
      
      // Chunk content and create embeddings
      const chunks = chunk(content, 500, 50)
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i]
        const embedding = await embed(chunkContent)
        
        await supabase
          .from('chunks')
          .insert({
            doc_id: doc.id,
            content: chunkContent,
            embedding: JSON.parse(embedding),
            chunk_index: i
          })
      }
      
      console.log(`✅ Completed: ${title}`)
    } catch (error) {
      console.error(`❌ Failed: ${url}`, error)
    }
  }
}

migrateData()
```

## 🔧 Step 5: Supabase Functions (Optional)

### 5.1 Create Search Function
In Supabase SQL Editor, create this function:

```sql
CREATE OR REPLACE FUNCTION search_with_role(
  query_embedding vector(1536),
  role_filter text,
  match_count int DEFAULT 8
)
RETURNS TABLE (
  content text,
  url text,
  title text,
  score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.content,
    d.url,
    d.title,
    1 - (c.embedding <=> query_embedding) +
    CASE WHEN role_filter = ANY(d.audiences) THEN 0.05 ELSE 0.0 END AS score
  FROM chunks c
  JOIN documents d ON d.id = c.doc_id
  ORDER BY score DESC
  LIMIT match_count;
END;
$$;
```

## 🚀 Step 6: Deployment Configuration

### 6.1 Vercel Environment Variables
In your Vercel dashboard, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
RAG_MODEL=gpt-4o-mini
RAG_MAX_TOKENS=2000
```

### 6.2 Update Package.json
Add Supabase dependency:

```bash
npm install @supabase/supabase-js
```

## 🔒 Step 7: Security Configuration

### 7.1 Row Level Security (RLS)
Enable RLS on your tables:

```sql
-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Allow read access to documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to chunks" ON chunks
  FOR SELECT USING (true);
```

### 7.2 API Keys Security
- **Anon Key**: Safe for client-side use
- **Service Role Key**: Keep secret, server-side only
- **Database Password**: Store securely

## 📈 Step 8: Monitoring & Analytics

### 8.1 Supabase Dashboard
Monitor your database usage in the Supabase dashboard:
- **Database**: Query performance, storage usage
- **API**: Request counts, response times
- **Auth**: User management (if you add authentication later)

### 8.2 Set Up Alerts
Configure alerts for:
- High database usage
- Slow queries
- API rate limits

## ✅ Step 9: Testing

### 9.1 Test Database Connection
```typescript
// Test script
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testConnection() {
  const { data, error } = await supabase
    .from('documents')
    .select('count')
    .limit(1)
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('✅ Supabase connection successful')
  }
}
```

### 9.2 Test Vector Search
```typescript
async function testVectorSearch() {
  const testEmbedding = new Array(1536).fill(0.1)
  
  const { data, error } = await supabase.rpc('search_with_role', {
    query_embedding: testEmbedding,
    role_filter: 'teacher',
    match_count: 5
  })
  
  if (error) {
    console.error('Vector search failed:', error)
  } else {
    console.log('✅ Vector search successful:', data)
  }
}
```

## 🎯 Step 10: Go Live

### 10.1 Final Checklist
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] pgvector extension enabled
- [ ] Environment variables configured
- [ ] Data migrated
- [ ] Search function created
- [ ] RLS policies set
- [ ] Vercel deployment updated
- [ ] Tests passing

### 10.2 Deployment
1. Push your updated code to GitHub
2. Vercel will automatically deploy
3. Test the live application
4. Monitor Supabase dashboard

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

---

## 💰 Cost Estimation

### Free Tier Limits:
- **Database**: 500MB storage
- **API**: 50,000 requests/month
- **Bandwidth**: 2GB/month

### Upgrade When Needed:
- **Pro Plan**: $25/month
- **Database**: 8GB storage
- **API**: 500,000 requests/month
- **Bandwidth**: 100GB/month

Your current usage should fit comfortably in the free tier for development and initial production use.
