/**
 * Text Chunking Utilities
 * Split long documents into overlapping chunks for better retrieval
 */

/**
 * Split text into chunks with overlap
 * @param text - Input text to chunk
 * @param targetTokens - Target chunk size in tokens (approximated by words)
 * @param overlapTokens - Number of overlapping tokens between chunks
 * @returns Array of text chunks
 */
export function chunk(
  text: string,
  targetTokens: number = 800,
  overlapTokens: number = 200
): string[] {
  // Normalize whitespace
  const normalized = text.replace(/\s+/g, " ").trim();
  
  // Split into words (rough token approximation: 1 word ≈ 1.3 tokens)
  const words = normalized.split(/\s+/);
  
  if (words.length === 0) return [];
  if (words.length <= targetTokens) return [normalized];

  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const slice = words.slice(i, i + targetTokens);
    chunks.push(slice.join(" "));
    
    // Move forward by (target - overlap) to create overlap
    i += targetTokens - overlapTokens;
    
    // Prevent infinite loop if overlap >= target
    if (i <= chunks.length * overlapTokens) {
      i = chunks.length * targetTokens;
    }
  }

  return chunks;
}

/**
 * Clean and normalize text before chunking
 */
export function normalizeText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, " ")
    // Remove special characters that might interfere
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    // Trim
    .trim();
}

/**
 * Split text by semantic boundaries (paragraphs, headings)
 * More sophisticated than word-based chunking
 */
export function semanticChunk(
  text: string,
  targetChars: number = 3000
): string[] {
  // Split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const paraText = para.trim();
    
    // If adding this paragraph exceeds target, start new chunk
    if (currentChunk.length + paraText.length > targetChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paraText;
    } else {
      currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paraText;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

