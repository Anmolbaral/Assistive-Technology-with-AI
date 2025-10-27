/**
 * RAG Chat API Endpoint
 * Handles queries with PII detection, vector search, and structured LLM responses
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { scan, POLICY_MESSAGE, getHint } from "@/lib/pii";
import { embed } from "@/lib/rag/embed";
import { searchWithRole } from "@/lib/rag/store";
import { buildSystemPrompt, buildUserPrompt, RESPONSE_SCHEMA } from "@/lib/rag/prompt";
import { ROLES } from "@/lib/roles";

// Force Node.js runtime (required for pg)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ask
 * Request body: { query: string }
 * Response: JSON schema or policy warning
 */
export async function POST(req: NextRequest) {
  try {
    // Debug: Log environment variables (without exposing secrets)
    console.log("Environment check:", {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasDatabaseURL: !!process.env.DATABASE_URL,
      ragModel: process.env.RAG_MODEL || "gpt-4o-mini",
      nodeEnv: process.env.NODE_ENV
    });

    // Parse request
    const body = await req.json();
    const { query, role = "teacher" } = body;

    // Validation
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' parameter" },
        { status: 400 }
      );
    }

    if (query.trim().length < 5) {
      return NextResponse.json(
        { error: "Query too short. Please provide more detail." },
        { status: 400 }
      );
    }

    if (query.length > 2000) {
      return NextResponse.json(
        { error: "Query too long. Please keep it under 2000 characters." },
        { status: 400 }
      );
    }

    // PII Detection
    if (scan(query)) {
      const hint = getHint(query);
      return NextResponse.json(
        {
          policy: true,
          message: POLICY_MESSAGE,
          hint,
        },
        { status: 200 }
      );
    }

    // Generate query embedding
    const queryEmbeddingStr = await embed(query);
    const queryEmbedding = JSON.parse(queryEmbeddingStr) as number[];

    // Role-aware vector similarity search
    const hits = await searchWithRole(queryEmbedding, role, 8);

    if (hits.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find relevant information in my knowledge base for that query. Please try rephrasing or contact your AT specialist directly.",
        recommendations: [],
        tips: [
          "Try using more general terms (e.g., 'reading support' instead of specific tool names)",
          "Include the student's grade level and the task they need to accomplish",
        ],
        sources: [],
        disclaimer:
          "For personalized support, contact your AT specialist.",
      });
    }

    // Build context for LLM
    const context = hits.map((hit) => ({
      content: hit.content,
      title: hit.title,
      url: hit.url,
    }));

    const sources = hits.map((hit) => ({
      title: hit.title,
      url: hit.url,
    }));

    // Remove duplicate sources
    const uniqueSources = Array.from(
      new Map(sources.map((s) => [s.url, s])).values()
    );

    // Build role-aware prompts
    const roleConfig = ROLES[role as keyof typeof ROLES] || ROLES.teacher;
    const roleHints = roleConfig.responseHints;
    
    const systemPrompt = `${buildSystemPrompt(uniqueSources)}

Persona: ${roleConfig.label}.
Follow these additional guidelines for this persona:
- ${roleHints.join("\n- ")}`;
    
    const userPrompt = buildUserPrompt(query, context);

    // Debug logging
    console.log("Role:", role);
    console.log("System prompt length:", systemPrompt.length);
    console.log("User prompt length:", userPrompt.length);
    console.log("Context chunks:", context.length);
    console.log("Sources:", uniqueSources.length);

    // Call OpenAI with structured output
    const completion = await client.chat.completions.create({
      model: process.env.RAG_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: parseInt(process.env.RAG_MAX_TOKENS || "2000"),
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from LLM");
    }

    console.log("Raw AI response:", responseContent);

    // Parse and validate response
    const jsonResponse = JSON.parse(responseContent);

    // Ensure response has required fields
    const validatedResponse = {
      answer: jsonResponse.answer || "I couldn't generate a proper response.",
      recommendations: jsonResponse.recommendations || [],
      tips: jsonResponse.tips || [],
      sources: jsonResponse.sources || uniqueSources.slice(0, 3),
      disclaimer:
        jsonResponse.disclaimer ||
        "Use the SETT Framework and your professional judgment. Consult your AT specialist for trials and training.",
      clarifyingQuestions: jsonResponse.clarifyingQuestions || [],
    };

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        error: "An error occurred processing your request. Please try again.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ask
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "TechBridge Learning AT Resource Assistant API",
    version: "1.0.0",
  });
}

