/**
 * Health Check API Endpoint
 * Tests database connection and environment variables
 */

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/rag/store";

export async function GET(req: NextRequest) {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasDatabaseURL: !!process.env.DATABASE_URL,
        ragModel: process.env.RAG_MODEL || "gpt-4o-mini",
        nodeEnv: process.env.NODE_ENV
      },
      database: {
        connected: false,
        documents: 0,
        chunks: 0,
        error: null as string | null
      }
    };

    // Test database connection
    try {
      const docResult = await pool.query("SELECT COUNT(*) as count FROM documents");
      const chunkResult = await pool.query("SELECT COUNT(*) as count FROM chunks");
      
      health.database.connected = true;
      health.database.documents = parseInt(docResult.rows[0].count);
      health.database.chunks = parseInt(chunkResult.rows[0].count);
    } catch (dbError) {
      health.database.error = dbError instanceof Error ? dbError.message : String(dbError);
    }

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}