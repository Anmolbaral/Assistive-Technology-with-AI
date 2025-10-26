// Quick test script to verify your database connection
// Run with: node test-db-connection.js

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const result = await pool.query('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('📊 PostgreSQL version:', result.rows[0].version.split(' ')[1]);
    
    // Check if pgvector is installed
    const vectorCheck = await pool.query(
      "SELECT * FROM pg_extension WHERE extname = 'vector'"
    );
    
    if (vectorCheck.rows.length > 0) {
      console.log('✅ pgvector extension is installed');
    } else {
      console.log('⚠️  pgvector extension NOT found');
      console.log('   Run this in Supabase SQL Editor:');
      console.log('   CREATE EXTENSION IF NOT EXISTS vector;');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Common fixes:');
    console.log('   1. Check your password is correct');
    console.log('   2. Ensure connection string includes ?sslmode=require');
    console.log('   3. Verify your IP is allowed (Supabase usually allows all)');
    process.exit(1);
  }
}

testConnection();

