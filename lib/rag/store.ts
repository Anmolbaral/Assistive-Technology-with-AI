/**
 * Vector Store (PostgreSQL + pgvector)
 * Database operations for document storage and similarity search
 */

import pg from "pg";
import { config } from "dotenv";

// Load environment variables
config({ path: '.env.local' });

const { Pool } = pg;

// Connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Tagged template literal for parameterized queries
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<unknown[]> {
  // Build parameterized query
  let query = strings[0];
  const params: unknown[] = [];
  
  for (let i = 0; i < values.length; i++) {
    params.push(values[i]);
    query += `$${i + 1}${strings[i + 1]}`;
  }

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Initialize database schema
 */
export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS vector;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id BIGSERIAL PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      title TEXT,
      crawled_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id BIGSERIAL PRIMARY KEY,
      doc_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
      chunk_index INT,
      content TEXT,
      embedding vector(1536)
    );
  `);

  // Create indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_chunks_embedding 
    ON chunks USING ivfflat (embedding vector_l2_ops)
    WITH (lists = 100);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_chunks_doc 
    ON chunks(doc_id);
  `);

  console.log("✓ Database schema initialized");
}

export interface SearchResult {
  content: string;
  url: string;
  title: string;
  score: number;
}

/**
 * Vector similarity search
 * @param queryEmbedding - Query vector (as number array)
 * @param k - Number of results to return
 * @returns Top-k similar chunks with metadata
 */
export async function search(
  queryEmbedding: number[],
  k: number = 8
): Promise<SearchResult[]> {
  const embeddingStr = JSON.stringify(queryEmbedding);

  const query = `
    SELECT 
      c.content,
      d.url,
      d.title,
      1 - (c.embedding <=> $1::vector) AS score
    FROM chunks c
    JOIN documents d ON d.id = c.doc_id
    ORDER BY c.embedding <=> $1::vector
    LIMIT $2
  `;

  try {
    const result = await pool.query(query, [embeddingStr, k]);
    return result.rows as SearchResult[];
  } catch (error) {
    console.error("Vector search error:", error);
    throw new Error("Search failed");
  }
}

/**
 * Role-aware vector similarity search with audience boost
 * @param queryEmbedding - Query vector (as number array)
 * @param role - User role for audience matching
 * @param k - Number of results to return
 * @returns Top-k similar chunks with metadata, boosted for role relevance
 */
export async function searchWithRole(
  queryEmbedding: number[],
  role: string,
  k: number = 8
): Promise<SearchResult[]> {
  const embeddingStr = JSON.stringify(queryEmbedding);

  // First try role-aware search
  const roleQuery = `
    SELECT 
      c.content,
      d.url,
      d.title,
      d.audiences,
      (c.embedding <=> $1::vector) +
      CASE WHEN $2 = ANY(d.audiences) THEN -0.05 ELSE 0.0 END
      AS rank
    FROM chunks c 
    JOIN documents d ON d.id = c.doc_id
    ORDER BY rank ASC
    LIMIT $3
  `;

  try {
    const result = await pool.query(roleQuery, [embeddingStr, role, k]);
    return result.rows.map(row => ({
      content: row.content,
      url: row.url,
      title: row.title,
      score: 1 - row.rank // Convert distance to similarity score
    })) as SearchResult[];
  } catch (error) {
    console.warn("Role-aware search failed, falling back to regular search:", error);
    
    // Fallback to regular search if audiences column doesn't exist
    return search(queryEmbedding, k);
  }
}

/**
 * Insert or update a document
 */
export async function upsertDocument(
  url: string,
  title: string,
  audiences: string[] = ['general']
): Promise<number> {
  // Try with audiences column first
  const queryWithAudiences = `
    INSERT INTO documents (url, title, audiences)
    VALUES ($1, $2, $3)
    ON CONFLICT (url) 
    DO UPDATE SET title = EXCLUDED.title, audiences = EXCLUDED.audiences, crawled_at = now()
    RETURNING id
  `;

  try {
    const result = await pool.query(queryWithAudiences, [url, title, audiences]);
    return result.rows[0].id;
  } catch (error) {
    console.warn("Insert with audiences failed, falling back to basic insert:", error);
    
    // Fallback to basic insert if audiences column doesn't exist
    const basicQuery = `
      INSERT INTO documents (url, title)
      VALUES ($1, $2)
      ON CONFLICT (url) 
      DO UPDATE SET title = EXCLUDED.title, crawled_at = now()
      RETURNING id
    `;
    
    const result = await pool.query(basicQuery, [url, title]);
    return result.rows[0].id;
  }
}

/**
 * Insert a chunk
 */
export async function insertChunk(
  docId: number,
  chunkIndex: number,
  content: string,
  embedding: string
): Promise<void> {
  await pool.query(
    `
    INSERT INTO chunks (doc_id, chunk_index, content, embedding)
    VALUES ($1, $2, $3, $4::vector)
    `,
    [docId, chunkIndex, content, embedding]
  );
}

/**
 * Delete all chunks for a document
 */
export async function deleteDocumentChunks(docId: number): Promise<void> {
  await pool.query("DELETE FROM chunks WHERE doc_id = $1", [docId]);
}

/**
 * Get document count
 */
export async function getDocumentCount(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) as count FROM documents");
  return parseInt(result.rows[0].count);
}

/**
 * Get chunk count
 */
export async function getChunkCount(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) as count FROM chunks");
  return parseInt(result.rows[0].count);
}

