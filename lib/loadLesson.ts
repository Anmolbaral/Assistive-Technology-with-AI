/**
 * MDX Lesson Loader
 * Dynamically loads lesson content
 */

import fs from "fs/promises";
import path from "path";

const lessonsDir = path.join(process.cwd(), "content");

export async function loadLessonContent(slug: string): Promise<string> {
  const filePath = path.join(lessonsDir, `lesson-${getNumFromSlug(slug)}.mdx`);
  
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Failed to load lesson ${slug}:`, error);
    throw new Error(`Lesson not found: ${slug}`);
  }
}

function getNumFromSlug(slug: string): string {
  const slugMap: Record<string, string> = {
    "responsible-ai": "1",
    "prompt-engineering": "2",
    "data-privacy": "3",
    "sett-framework": "4",
  };
  
  return slugMap[slug] || "1";
}

