// Reset database script - drops existing tables and recreates them
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function resetDatabase() {
  console.log('🔄 Resetting database...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    // Drop existing tables (CASCADE will drop chunks table automatically)
    console.log('🗑️  Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS chunks CASCADE');
    await pool.query('DROP TABLE IF EXISTS documents CASCADE');
    console.log('✅ Tables dropped\n');
    
    // Create pgvector extension
    console.log('🔧 Ensuring pgvector extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log('✅ pgvector extension ready\n');
    
    // Create documents table
    console.log('📋 Creating documents table...');
    await pool.query(`
      CREATE TABLE documents (
        id BIGSERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        title TEXT,
        crawled_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);
    console.log('✅ Documents table created\n');
    
    // Create chunks table with 1536 dimensions
    console.log('📋 Creating chunks table (1536 dimensions)...');
    await pool.query(`
      CREATE TABLE chunks (
        id BIGSERIAL PRIMARY KEY,
        doc_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
        chunk_index INT,
        content TEXT,
        embedding vector(1536)
      )
    `);
    console.log('✅ Chunks table created\n');
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await pool.query(`
      CREATE INDEX idx_chunks_embedding 
      ON chunks USING ivfflat (embedding vector_l2_ops)
      WITH (lists = 100)
    `);
    await pool.query('CREATE INDEX idx_chunks_doc ON chunks(doc_id)');
    console.log('✅ Indexes created\n');
    
    console.log('🎉 Database reset complete!\n');
    console.log('You can now run: npm run ingest\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

resetDatabase();


