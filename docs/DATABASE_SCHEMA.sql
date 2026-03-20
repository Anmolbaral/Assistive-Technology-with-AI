-- TechBridge Learning AT Training Platform
-- Database Schema for PostgreSQL + pgvector
-- 
-- Requirements:
-- - PostgreSQL 12+
-- - pgvector extension (https://github.com/pgvector/pgvector)
--
-- Usage:
-- 1. Connect to your database
-- 2. Run this script to create tables and indexes
-- 3. Run the ingestion script: npm run ingest

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Documents Table
-- Stores metadata about crawled source URLs
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Metadata (optional, for future use)
  category TEXT,
  last_modified TIMESTAMP WITH TIME ZONE,
  content_hash TEXT,
  
  -- Role-based audience tagging for persona-aware retrieval
  audiences text[] DEFAULT ARRAY['general']
);

-- Index for faster lookups by URL
CREATE INDEX IF NOT EXISTS idx_documents_url ON documents(url);

-- Index for category filtering (if used)
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

-- Index for audience-based filtering and role-aware search
CREATE INDEX IF NOT EXISTS idx_documents_audiences ON documents USING GIN(audiences);

COMMENT ON TABLE documents IS 'Stores metadata about indexed source documents';
COMMENT ON COLUMN documents.url IS 'Unique source URL (e.g., Edutopia article)';
COMMENT ON COLUMN documents.title IS 'Extracted document title';
COMMENT ON COLUMN documents.crawled_at IS 'Timestamp of last crawl/index';
COMMENT ON COLUMN documents.audiences IS 'Array of role tags (teacher, at_specialist, coach, general) for persona-aware retrieval';

-- ============================================================================
-- Chunks Table
-- Stores text chunks with vector embeddings for similarity search
-- ============================================================================

CREATE TABLE IF NOT EXISTS chunks (
  id BIGSERIAL PRIMARY KEY,
  doc_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(3072),  -- Dimension for text-embedding-3-large
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  token_count INT,
  
  -- Constraints
  CONSTRAINT chunks_doc_index_unique UNIQUE (doc_id, chunk_index),
  CONSTRAINT chunks_content_not_empty CHECK (length(content) > 0)
);

-- ============================================================================
-- Vector Search Indexes
-- ============================================================================

-- IVFFlat index for fast approximate nearest neighbor search
-- Lists parameter: sqrt(total_chunks) is a good heuristic
-- For 1000 chunks: lists=31; for 10000 chunks: lists=100
CREATE INDEX IF NOT EXISTS idx_chunks_embedding 
ON chunks 
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Standard index for joins
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);

-- Index for ordering by chunk position within a document
CREATE INDEX IF NOT EXISTS idx_chunks_doc_index ON chunks(doc_id, chunk_index);

COMMENT ON TABLE chunks IS 'Text chunks with vector embeddings for RAG';
COMMENT ON COLUMN chunks.doc_id IS 'Foreign key to parent document';
COMMENT ON COLUMN chunks.chunk_index IS 'Position of chunk within document (0-indexed)';
COMMENT ON COLUMN chunks.content IS 'Text content of this chunk (~800 tokens)';
COMMENT ON COLUMN chunks.embedding IS 'Vector embedding (3072-dim for text-embedding-3-large)';

-- ============================================================================
-- Helper Views (Optional)
-- ============================================================================

-- View: Document statistics
CREATE OR REPLACE VIEW document_stats AS
SELECT 
  d.id,
  d.url,
  d.title,
  COUNT(c.id) as chunk_count,
  d.crawled_at
FROM documents d
LEFT JOIN chunks c ON c.doc_id = d.id
GROUP BY d.id, d.url, d.title, d.crawled_at
ORDER BY d.crawled_at DESC;

COMMENT ON VIEW document_stats IS 'Summary of documents with chunk counts';

-- ============================================================================
-- Example Queries
-- ============================================================================

-- Count total documents and chunks
-- SELECT 
--   (SELECT COUNT(*) FROM documents) as total_docs,
--   (SELECT COUNT(*) FROM chunks) as total_chunks;

-- Find documents with most chunks
-- SELECT * FROM document_stats ORDER BY chunk_count DESC LIMIT 10;

-- Vector similarity search (example)
-- SELECT 
--   c.content,
--   d.url,
--   d.title,
--   1 - (c.embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
-- FROM chunks c
-- JOIN documents d ON d.id = c.doc_id
-- ORDER BY c.embedding <=> '[0.1, 0.2, ...]'::vector
-- LIMIT 8;

-- ============================================================================
-- Cleanup Functions (Optional)
-- ============================================================================

-- Function: Delete a document and all its chunks
CREATE OR REPLACE FUNCTION delete_document(doc_url TEXT)
RETURNS void AS $$
BEGIN
  DELETE FROM documents WHERE url = doc_url;
  -- Cascades to chunks automatically
END;
$$ LANGUAGE plpgsql;

-- Function: Get total vector storage size
CREATE OR REPLACE FUNCTION vector_storage_size()
RETURNS TEXT AS $$
SELECT pg_size_pretty(
  pg_total_relation_size('chunks')
) as total_size;
$$ LANGUAGE sql;

-- ============================================================================
-- Grants (Adjust for your deployment)
-- ============================================================================

-- Example: Grant read/write to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON documents, chunks TO app_user;
-- GRANT USAGE, SELECT ON SEQUENCE documents_id_seq, chunks_id_seq TO app_user;

-- ============================================================================
-- Migration Notes
-- ============================================================================

-- If you need to change embedding dimension (e.g., switch to text-embedding-3-small):
-- 1. Backup your database
-- 2. ALTER TABLE chunks ALTER COLUMN embedding TYPE vector(1536);
-- 3. Re-run ingestion script with new EMBED_MODEL

-- If you need to re-index (e.g., after adding 1000+ new chunks):
-- REINDEX INDEX idx_chunks_embedding;

-- ============================================================================
-- Performance Tuning
-- ============================================================================

-- For production workloads, consider:
-- - Increasing shared_buffers (25% of RAM)
-- - Tuning effective_cache_size
-- - Adding connection pooling (PgBouncer)
-- - Monitoring query performance with pg_stat_statements

-- Example: Analyze table statistics
-- ANALYZE documents;
-- ANALYZE chunks;

-- ============================================================================
-- End of Schema
-- ============================================================================

