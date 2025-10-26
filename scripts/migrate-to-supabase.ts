/**
 * Supabase Migration Script
 * Migrates data from existing PostgreSQL setup to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { embed } from '../lib/rag/embed'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Data sources to migrate
const SOURCES = [
  'https://www.edutopia.org/article/free-assistive-tech-tools-support-academic-success/',
  'https://www.teachingchannel.com/k12-hub/blog/assistive-technology-tools-for-your-classroom/',
  'https://ssd.umich.edu/article/assistive-technology-resources',
  'https://www.joyzabala.com/links-resources',
  'https://mn.gov/admin/at/learning/prek-12/sett-framework.jsp',
  'https://www.centralriversaea.org/educators/professional-learning/',
  'https://www.centralriversaea.org/educators/special-education/assistive-technology/',
  'https://www.frontiersin.org/journals/education',
  'https://www.atia.org/',
  'https://iowaaea.org/community-partners/special-education-services/assistive-technology/',
  'https://sites.google.com/aea9.k12.ia.us/mbaeaatdept/sett-framework',
  'https://educate.iowa.gov/pk-12/special-education/programs-services/assistive-technology',
  'https://www.edutopia.org/article/training-instructional-coaches-technology-integration/',
  'https://www.texthelp.com/en-us/products/read-write/',
  'https://www.donjohnston.com/cowriter/',
  'https://www.kamiapp.com/',
  'https://padlet.com/',
  'https://www.grammarly.com/',
  'https://www.naturalreaders.com/',
  'https://www.bookshare.org/',
  'https://learningally.org/',
  'https://www.microsoft.com/en-us/edge/features/immersive-reader'
]

/**
 * Infer audience tags based on URL patterns
 */
function inferAudiences(url: string): string[] {
  const u = url.toLowerCase()
  const tags = new Set<string>(["general"])

  // Teacher-focused resources
  if (u.includes("edutopia") || u.includes("teachingchannel")) {
    tags.add("teacher")
  }

  // AT Specialist-focused resources
  if (u.includes("frontiersin") || u.includes("atia") || u.includes("mn.gov")) {
    tags.add("at_specialist")
  }

  // Coach-focused resources
  if (u.includes("professional-learning") || u.includes("coaches") || u.includes("pd")) {
    tags.add("coach")
  }

  // Multi-audience resources
  if (u.includes("centralriversaea.org")) {
    tags.add("teacher")
    tags.add("coach")
  }

  if (u.includes("iowaaea.org") || u.includes("educate.iowa.gov")) {
    tags.add("at_specialist")
  }

  // SETT Framework resources are useful for all roles
  if (u.includes("sett") || u.includes("joyzabala")) {
    tags.add("teacher")
    tags.add("at_specialist")
    tags.add("coach")
  }

  return Array.from(tags)
}

/**
 * Simple text chunking function
 */
function chunk(text: string, maxChunkSize: number = 500, overlap: number = 50): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  
  for (let i = 0; i < words.length; i += maxChunkSize - overlap) {
    const chunk = words.slice(i, i + maxChunkSize).join(' ')
    if (chunk.trim()) {
      chunks.push(chunk.trim())
    }
  }
  
  return chunks
}

/**
 * Fetch and parse content from URL
 */
async function fetchAndParse(url: string): Promise<{ title: string; content: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TechBridge Learning Bot/1.0 (Educational Content Aggregator)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // Simple HTML parsing (you might want to use a proper HTML parser)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname
    
    // Remove HTML tags and clean up text
    const content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000) // Limit content length
    
    return { title, content }
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    throw error
  }
}

/**
 * Test Supabase connection
 */
async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documents')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('Connection test error:', error)
    return false
  }
}

/**
 * Migrate a single document
 */
async function migrateDocument(url: string): Promise<void> {
  try {
    console.log(`\n📄 Processing: ${url}`)
    
    // Check if document already exists
    const existing = await supabase
      .from('documents')
      .select('id')
      .eq('url', url)
      .single()
    
    if (existing.data) {
      console.log(`⏭️  Skipping (already exists): ${url}`)
      return
    }
    
    // Fetch and parse content
    const { title, content } = await fetchAndParse(url)
    console.log(`📝 Title: ${title}`)
    
    // Infer audience tags
    const audiences = inferAudiences(url)
    console.log(`👥 Audiences: ${audiences.join(', ')}`)
    
    // Insert document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        url,
        title,
        audiences,
        crawled_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (docError) {
      throw new Error(`Failed to insert document: ${docError.message}`)
    }
    
    console.log(`✅ Document inserted with ID: ${doc.id}`)
    
    // Chunk content
    const chunks = chunk(content, 500, 50)
    console.log(`📦 Created ${chunks.length} chunks`)
    
    // Create embeddings for each chunk
    const embeddings: number[][] = []
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🧠 Creating embedding ${i + 1}/${chunks.length}...`)
      const embedding = await embed(chunks[i])
      embeddings.push(JSON.parse(embedding))
    }
    
    // Insert chunks
    const chunkData = chunks.map((content, index) => ({
      doc_id: doc.id,
      content,
      embedding: embeddings[index],
      chunk_index: index
    }))
    
    const { error: chunksError } = await supabase
      .from('chunks')
      .insert(chunkData)
    
    if (chunksError) {
      throw new Error(`Failed to insert chunks: ${chunksError.message}`)
    }
    
    console.log(`✅ Inserted ${chunks.length} chunks with embeddings`)
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${url}:`, error)
    throw error
  }
}

/**
 * Get migration statistics
 */
async function getStats(): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('get_document_stats')
    
    if (error) {
      console.error('Failed to get stats:', error)
      return
    }
    
    console.log('\n📊 Migration Statistics:')
    console.log(`📄 Total documents: ${data[0].total_documents}`)
    console.log(`📦 Total chunks: ${data[0].total_chunks}`)
    console.log(`📈 Avg chunks per doc: ${data[0].avg_chunks_per_doc}`)
    console.log(`🕒 Latest crawl: ${data[0].latest_crawl}`)
  } catch (error) {
    console.error('Error getting stats:', error)
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('🚀 Starting Supabase migration...')
  
  // Test connection
  const connected = await testConnection()
  if (!connected) {
    console.error('❌ Cannot connect to Supabase. Check your credentials.')
    process.exit(1)
  }
  
  // Get initial stats
  console.log('\n📊 Initial state:')
  await getStats()
  
  // Migrate each document
  let successCount = 0
  let errorCount = 0
  
  for (const url of SOURCES) {
    try {
      await migrateDocument(url)
      successCount++
    } catch (error) {
      console.error(`❌ Failed: ${url}`)
      errorCount++
    }
  }
  
  // Final stats
  console.log('\n📊 Final state:')
  await getStats()
  
  console.log('\n🎉 Migration completed!')
  console.log(`✅ Successfully migrated: ${successCount} documents`)
  console.log(`❌ Failed: ${errorCount} documents`)
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some documents failed to migrate. Check the errors above.')
  }
}

/**
 * Clean up function (removes all data)
 */
async function cleanup(): Promise<void> {
  console.log('🧹 Cleaning up Supabase data...')
  
  const { error: chunksError } = await supabase
    .from('chunks')
    .delete()
    .neq('id', 0) // Delete all chunks
  
  if (chunksError) {
    console.error('Failed to delete chunks:', chunksError)
  } else {
    console.log('✅ Deleted all chunks')
  }
  
  const { error: docsError } = await supabase
    .from('documents')
    .delete()
    .neq('id', 0) // Delete all documents
  
  if (docsError) {
    console.error('Failed to delete documents:', docsError)
  } else {
    console.log('✅ Deleted all documents')
  }
  
  console.log('🧹 Cleanup completed')
}

// CLI interface
const command = process.argv[2]

switch (command) {
  case 'migrate':
    migrate().catch(console.error)
    break
  case 'cleanup':
    cleanup().catch(console.error)
    break
  case 'stats':
    getStats().catch(console.error)
    break
  default:
    console.log('Usage:')
    console.log('  npm run migrate:supabase migrate  - Migrate data to Supabase')
    console.log('  npm run migrate:supabase cleanup  - Clean up all data')
    console.log('  npm run migrate:supabase stats     - Show statistics')
}
