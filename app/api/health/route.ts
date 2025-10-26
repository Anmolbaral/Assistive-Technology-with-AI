/**
 * Health Check Endpoint
 * Used by monitoring and deployment systems
 */

import { NextResponse } from "next/server";
import { getDocumentCount, getChunkCount } from "@/lib/rag/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check database connectivity
    const docCount = await getDocumentCount();
    const chunkCount = await getChunkCount();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        documents: docCount,
        chunks: chunkCount,
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}

