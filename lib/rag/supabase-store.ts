/**
 * Supabase Database Store
 * Handles vector search and document storage using Supabase
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export interface SearchResult {
  content: string;
  url: string;
  title: string;
  score: number;
}

export interface Document {
  id: number;
  url: string;
  title: string;
  audiences: string[];
  crawled_at: string;
}

/**
 * Search for similar content using vector similarity
 */
export async function search(
  queryEmbedding: number[],
  k: number = 8
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('search_similar', {
    query_embedding: queryEmbedding,
    match_count: k
  })

  if (error) {
    console.error('Search error:', error)
    throw new Error(`Search failed: ${error.message}`)
  }

  return data || []
}

/**
 * Search with role-based filtering
 */
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

  if (error) {
    console.error('Role search error:', error)
    // Fallback to regular search if role function doesn't exist
    return search(queryEmbedding, k)
  }

  return data || []
}

/**
 * Insert or update a document
 */
export async function upsertDocument(
  url: string,
  title: string,
  audiences: string[] = ['general']
): Promise<number> {
  const { data, error } = await supabase
    .from('documents')
    .upsert({
      url,
      title,
      audiences,
      crawled_at: new Date().toISOString()
    }, {
      onConflict: 'url'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Upsert document error:', error)
    throw new Error(`Failed to upsert document: ${error.message}`)
  }

  return data.id
}

/**
 * Insert chunks with embeddings
 */
export async function insertChunks(
  docId: number,
  chunks: string[],
  embeddings: number[][]
): Promise<void> {
  const chunkData = chunks.map((content, index) => ({
    doc_id: docId,
    content,
    embedding: embeddings[index],
    chunk_index: index
  }))

  const { error } = await supabase
    .from('chunks')
    .insert(chunkData)

  if (error) {
    console.error('Insert chunks error:', error)
    throw new Error(`Failed to insert chunks: ${error.message}`)
  }
}

/**
 * Get document by URL
 */
export async function getDocumentByUrl(url: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('url', url)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Get document error:', error)
    throw new Error(`Failed to get document: ${error.message}`)
  }

  return data
}

/**
 * Get all documents
 */
export async function getAllDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('crawled_at', { ascending: false })

  if (error) {
    console.error('Get all documents error:', error)
    throw new Error(`Failed to get documents: ${error.message}`)
  }

  return data || []
}

/**
 * Delete document and its chunks
 */
export async function deleteDocument(url: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('url', url)

  if (error) {
    console.error('Delete document error:', error)
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

/**
 * Get database statistics
 */
export async function getStats(): Promise<{
  documentCount: number;
  chunkCount: number;
  totalSize: number;
}> {
  const [documentsResult, chunksResult] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('chunks').select('id', { count: 'exact', head: true })
  ])

  if (documentsResult.error) {
    throw new Error(`Failed to get document count: ${documentsResult.error.message}`)
  }

  if (chunksResult.error) {
    throw new Error(`Failed to get chunk count: ${chunksResult.error.message}`)
  }

  return {
    documentCount: documentsResult.count || 0,
    chunkCount: chunksResult.count || 0,
    totalSize: 0 // Supabase doesn't provide size info in free tier
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Connection test failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}
