-- Supabase SQL Functions for TechBridge Learning Platform
-- Run these in the Supabase SQL Editor

-- 1. Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Basic similarity search function
CREATE OR REPLACE FUNCTION search_similar(
  query_embedding vector(1536),
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
    1 - (c.embedding <=> query_embedding) AS score
  FROM chunks c
  JOIN documents d ON d.id = c.doc_id
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. Role-aware search function
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

-- 4. Function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats()
RETURNS TABLE (
  total_documents bigint,
  total_chunks bigint,
  avg_chunks_per_doc numeric,
  latest_crawl timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(c.id) as total_chunks,
    ROUND(AVG(chunk_counts.chunk_count), 2) as avg_chunks_per_doc,
    MAX(d.crawled_at) as latest_crawl
  FROM documents d
  LEFT JOIN chunks c ON c.doc_id = d.id
  LEFT JOIN (
    SELECT doc_id, COUNT(*) as chunk_count
    FROM chunks
    GROUP BY doc_id
  ) chunk_counts ON chunk_counts.doc_id = d.id;
END;
$$;

-- 5. Function to clean up old chunks (maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_chunks()
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM chunks 
  WHERE doc_id NOT IN (SELECT id FROM documents);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 6. Function to search by audience tags
CREATE OR REPLACE FUNCTION search_by_audience(
  query_embedding vector(1536),
  audience_tags text[],
  match_count int DEFAULT 8
)
RETURNS TABLE (
  content text,
  url text,
  title text,
  audiences text[],
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
    d.audiences,
    1 - (c.embedding <=> query_embedding) AS score
  FROM chunks c
  JOIN documents d ON d.id = c.doc_id
  WHERE d.audiences && audience_tags  -- Overlap with any of the audience tags
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Function to get popular documents by search frequency
CREATE OR REPLACE FUNCTION get_popular_documents(
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  url text,
  title text,
  audiences text[],
  chunk_count bigint,
  last_searched timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.url,
    d.title,
    d.audiences,
    COUNT(c.id) as chunk_count,
    MAX(d.crawled_at) as last_searched
  FROM documents d
  LEFT JOIN chunks c ON c.doc_id = d.id
  GROUP BY d.id, d.url, d.title, d.audiences
  ORDER BY chunk_count DESC, d.crawled_at DESC
  LIMIT limit_count;
END;
$$;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_cosine 
ON chunks USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_l2 
ON chunks USING ivfflat (embedding vector_l2_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_ip 
ON chunks USING ivfflat (embedding vector_ip_ops) 
WITH (lists = 100);

-- 9. Row Level Security policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- Allow read access to all documents and chunks
CREATE POLICY "Allow read access to documents" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to chunks" ON chunks
  FOR SELECT USING (true);

-- Allow insert/update for service role (API operations)
CREATE POLICY "Allow service role to manage documents" ON documents
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to manage chunks" ON chunks
  FOR ALL USING (auth.role() = 'service_role');

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 11. Create a view for easy document browsing
CREATE OR REPLACE VIEW document_overview AS
SELECT 
  d.id,
  d.url,
  d.title,
  d.audiences,
  d.crawled_at,
  COUNT(c.id) as chunk_count,
  CASE 
    WHEN COUNT(c.id) = 0 THEN 'No chunks'
    WHEN COUNT(c.id) < 5 THEN 'Low'
    WHEN COUNT(c.id) < 20 THEN 'Medium'
    ELSE 'High'
  END as chunk_density
FROM documents d
LEFT JOIN chunks c ON c.doc_id = d.id
GROUP BY d.id, d.url, d.title, d.audiences, d.crawled_at
ORDER BY d.crawled_at DESC;

-- 12. Create a function to reindex embeddings (if needed)
CREATE OR REPLACE FUNCTION reindex_embeddings()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would rebuild the vector indexes
  -- Note: This is a placeholder - actual reindexing depends on your specific needs
  RETURN 'Vector indexes are automatically maintained by Supabase';
END;
$$;

-- 13. Add comments for documentation
COMMENT ON FUNCTION search_similar IS 'Basic vector similarity search using cosine distance';
COMMENT ON FUNCTION search_with_role IS 'Role-aware search that boosts results matching user role';
COMMENT ON FUNCTION search_by_audience IS 'Search documents by specific audience tags';
COMMENT ON FUNCTION get_document_stats IS 'Get overall statistics about documents and chunks';
COMMENT ON FUNCTION cleanup_orphaned_chunks IS 'Remove chunks that reference deleted documents';
COMMENT ON FUNCTION get_popular_documents IS 'Get most chunked documents (popular content)';
COMMENT ON VIEW document_overview IS 'Overview of all documents with chunk counts and density';

-- 14. Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'vector_extension', EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector'),
    'documents_count', (SELECT COUNT(*) FROM documents),
    'chunks_count', (SELECT COUNT(*) FROM chunks)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 15. Test the functions (optional - remove in production)
-- Uncomment these lines to test the functions:

-- SELECT * FROM health_check();
-- SELECT * FROM get_document_stats();
-- SELECT * FROM get_popular_documents(5);
