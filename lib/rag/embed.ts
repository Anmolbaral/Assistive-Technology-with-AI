/**
 * Embedding Provider (OpenAI)
 * Provider-agnostic interface for generating text embeddings
 */

import OpenAI from "openai";
import { config } from "dotenv";

// Load environment variables
config({ path: '.env.local' });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding vector for text
 * Returns JSON-stringified array for pgvector compatibility
 */
export async function embed(text: string): Promise<string> {
  try {
    const response = await client.embeddings.create({
      model: process.env.EMBED_MODEL || "text-embedding-3-large",
      input: text.slice(0, 8000), // Truncate to stay within limits
    });

    return JSON.stringify(response.data[0].embedding);
  } catch (error) {
    console.error("Embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Get embedding dimension for the current model
 */
export function getEmbeddingDimension(): number {
  const model = process.env.EMBED_MODEL || "text-embedding-3-small";
  
  // text-embedding-3-large: 3072 dimensions (not recommended for IVFFlat)
  // text-embedding-3-small: 1536 dimensions (recommended)
  return model.includes("large") ? 3072 : 1536;
}

