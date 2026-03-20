/**
 * RAG System Prompts & Response Schema
 * Defines the chat assistant's behavior and output format
 */

/**
 * System prompt for the RAG assistant
 */
export const SYSTEM_PROMPT = `You are the TechBridge Learning Assistive Technology Resource Assistant.

Your role is to help K-12 educators find evidence-based AT tools and strategies for their students. You are:
- Professional, concise, and friendly
- Evidence-based: Use only the provided sources; cite them clearly
- Practical: Organize recommendations by tech level (Low-Tech, Mid-Tech, High-Tech)
- Supportive: Include 1-2 actionable implementation tips
- Humble: Always remind educators to use professional judgment and consult AT specialists
- Inquisitive: Ask clarifying questions when queries are too vague or missing key details

CRITICAL PRIVACY RULE:
If a query contains student names, IDs, photos, or other PII, refuse to answer and explain the privacy policy. Never process, store, or infer from PII.

RESPONSE STRUCTURE:

GENERAL AT TOOL QUERIES:
1. Brief answer
2. Recommendations by tech level (ONLY when query asks for specific tools): Low-Tech (pencil grips, highlighters, graphic organizers), Mid-Tech (apps, software), High-Tech (specialized devices)
3. 1-2 implementation tips
4. 2-6 source citations (title + URL)
5. Brief professional judgment reminder

Only include recommendations when the query asks for tools or strategies. For conceptual questions or PD requests, focus on answer and tips.

STRUCTURED REQUESTS (PD agendas, lesson plans, frameworks):
1. Create the COMPLETE structure with specific time blocks, activities, materials
2. Include implementation steps, materials needed, success metrics
3. Provide 2-6 source citations
4. Brief professional judgment reminder

CRITICAL: Do NOT truncate structured responses. Provide the FULL content in the answer field.

CLARIFYING QUESTIONS:
When the query is vague, ask 1-2 questions (e.g., grade level, specific challenges, available technology, what's been tried). Populate clarifyingQuestions and keep answer minimal.

TOOL LINKS:
Include official links in markdown: [Tool Name](url). Verified links: Google Voice Typing (https://support.google.com/docs/answer/4492226), Read&Write (https://www.texthelp.com/products/read-write/), Co:Writer (https://www.donjohnston.com/cowriter/), Lucidchart (https://www.lucidchart.com/), Padlet (https://padlet.com/), Grammarly (https://www.grammarly.com/), Kami (https://www.kamiapp.com/), Google Docs (https://docs.google.com/), Google Keep (https://keep.google.com/), Immersive Reader (https://www.microsoft.com/en-us/edge/features/immersive-reader), Natural Reader (https://www.naturalreaders.com/), Bookshare (https://www.bookshare.org/).

AVOID (deprecated, no longer in Chrome Web Store): Select and Speak, Mercury Reader, Skimzee. Use alternatives: Natural Reader, Immersive Reader, Read&Write, Snap&Read.

FORMATTING:
- Tables: Use markdown tables for comparisons
- Charts: Use \`\`\`chart:bar or chart:pie with title: and label:value rows
- Images: ![alt](url) when helpful

Use ONLY the sources provided in the context. Do not invent tools or resources.`;

/**
 * Generate the full system prompt with source list
 */
export function buildSystemPrompt(sources: Array<{ title: string; url: string }>): string {
  const sourceList = sources
    .map((s) => `- ${s.title} (${s.url})`)
    .join("\n");

  return `${SYSTEM_PROMPT}\n\nUSE THESE SOURCES ONLY:\n${sourceList}`;
}

/**
 * JSON response schema for structured output
 */
export const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    answer: {
      type: "string",
      description: "Complete answer to the educator's query. For structured requests (PD agendas, lesson plans), include the FULL requested structure with specific time blocks, activities, and materials. Do not truncate or summarize - provide the complete content.",
    },
    recommendations: {
      type: "array",
      description: "AT tools organized by tech level (only include if query asks for specific tools)",
      items: {
        type: "object",
        properties: {
          level: {
            type: "string",
            enum: ["Low-Tech", "Mid-Tech", "High-Tech"],
            description: "Technology level category",
          },
          items: {
            type: "array",
            items: { type: "string" },
            description: "Specific tool or strategy names",
          },
        },
        required: ["level", "items"],
      },
    },
    tips: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 3,
      description: "Practical implementation tips for educators",
    },
    sources: {
      type: "array",
      description: "Citations from the provided source list only",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
        required: ["title", "url"],
      },
      minItems: 2,
      maxItems: 6,
    },
    disclaimer: {
      type: "string",
      description: "Professional judgment reminder (brief, 1 sentence)",
    },
    clarifyingQuestions: {
      type: "array",
      items: { type: "string" },
      description: "Optional clarifying questions to ask if the query is vague or missing key details",
    },
  },
  required: ["answer", "tips", "sources", "disclaimer"],
} as const;

/**
 * Format user query with context for the LLM
 */
export function buildUserPrompt(
  query: string,
  context: Array<{ content: string; title: string; url: string }>
): string {
  const contextStr = context
    .map(
      (c, i) =>
        `[Source ${i + 1}]\nTitle: ${c.title}\nURL: ${c.url}\nContent: ${c.content}`
    )
    .join("\n\n---\n\n");

  return `Question: ${query}\n\n===CONTEXT===\n${contextStr}\n\nReturn a JSON response with these fields:
- answer: string (COMPLETE answer to the query - for structured requests like PD agendas, include the FULL detailed structure)
- recommendations: array of {level: "Low-Tech"|"Mid-Tech"|"High-Tech", items: string[]} (only if asking for specific tools)
- tips: string[] (1-3 implementation tips)
- sources: array of {title: string, url: string} (2-6 citations)
- disclaimer: string (brief professional judgment reminder)
- clarifyingQuestions: string[] (optional questions if query is vague)

IMPORTANT: For structured requests (PD agendas, lesson plans), provide the COMPLETE detailed content in the answer field. Do not truncate or summarize.`;
}

/**
 * Default disclaimer text
 */
export const DEFAULT_DISCLAIMER =
  "Use the SETT Framework and your professional judgment. Consult your AT specialist for trials and training.";

/**
 * Example successful response (for reference/testing)
 */
export const EXAMPLE_RESPONSE = {
  answer:
    "Students with organizational challenges benefit from visual planning tools and digital organization platforms. Here are options by tech level.",
  recommendations: [
    {
      level: "Low-Tech",
      items: [
        "Graphic organizers on paper (e.g., [mind maps](https://www.mindmapping.com/mind-map), [Venn diagrams](https://www.canva.com/graphs/venn-diagrams/))",
        "Paper-based planning templates",
        "Sticky notes for brainstorming",
      ],
    },
    {
      level: "Mid-Tech",
      items: [
        "[Lucidchart](https://www.lucidchart.com/) (for creating diagrams and flowcharts)",
        "[Padlet](https://padlet.com/) (for collaborative brainstorming and organizing ideas)",
        "[Google Keep](https://keep.google.com/) (digital sticky notes)",
      ],
    },
    {
      level: "High-Tech",
      items: [
        "[Google Docs](https://docs.google.com/) (using built-in templates for graphic organizers)",
        "[Notion](https://www.notion.so/) (advanced organization and databases)",
        "[Miro](https://miro.com/) (digital whiteboard for visual thinking)",
      ],
    },
  ],
  tips: [
    "Start with free tools and model usage in small groups",
    "Collect data for 2-3 weeks before expanding",
  ],
  sources: [
    {
      title: "Edutopia — Free AT Tools",
      url: "https://www.edutopia.org/article/free-assistive-tech-tools-support-academic-success/",
    },
    {
      title: "Joy Zabala — SETT Framework Resources",
      url: "https://www.joyzabala.com/links-resources",
    },
  ],
  disclaimer: DEFAULT_DISCLAIMER,
};

