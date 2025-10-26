#!/usr/bin/env tsx
/**
 * Ingestion Script
 * Run this to populate the vector database with source documents
 * 
 * Usage:
 *   pnpm tsx scripts/ingest.ts
 *   NODE_ENV=production pnpm tsx scripts/ingest.ts
 */

import { config } from "dotenv";
import { ingest } from "../lib/rag/ingest";
import { initSchema, getDocumentCount, getChunkCount } from "../lib/rag/store";

// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  try {
    console.log("📚 TechBridge Learning AT Resource Ingestion\n");

    // Validate environment
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    // Initialize database schema
    console.log("🔧 Initializing database schema...");
    await initSchema();
    console.log("");

    // Run ingestion
    await ingest();

    // Show stats
    console.log("\n📊 Database Statistics:");
    const docCount = await getDocumentCount();
    const chunkCount = await getChunkCount();
    console.log(`  Documents: ${docCount}`);
    console.log(`  Chunks: ${chunkCount}`);
    console.log("");

    console.log("🎉 All done! Vector database is ready.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Ingestion failed:");
    console.error(error);
    process.exit(1);
  }
}

main();

