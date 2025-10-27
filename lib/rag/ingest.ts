/**
 * Content Ingestion Pipeline
 * Crawl, parse, chunk, embed, and store documents in the vector database
 */

import { JSDOM } from "jsdom";
import * as cheerio from "cheerio";
import { Readability } from "@mozilla/readability";
import { embed } from "./embed";
import { upsertDocument, insertChunk, deleteDocumentChunks } from "./store";
import { chunk, normalizeText } from "./chunk";

/**
 * Infer audience tags based on URL patterns
 * This automatically categorizes documents for role-based retrieval
 */
function inferAudiences(url: string): string[] {
  const u = url.toLowerCase();
  const tags = new Set<string>(["general"]);
  
  // Teacher-focused resources
  if (u.includes("edutopia") || u.includes("teachingchannel") || 
      u.includes("leanderisd") || u.includes("morainepark") || 
      u.includes("uis.edu") || u.includes("helenkeller")) {
    tags.add("teacher");
  }
  
  // AT Specialist-focused resources
  if (u.includes("frontiersin") || u.includes("atia") || u.includes("mn.gov") ||
      u.includes("resna") || u.includes("at3center") || u.includes("ataprogram") ||
      u.includes("icater") || u.includes("infinitec") || u.includes("inglis") ||
      u.includes("boundlessat") || u.includes("texthelp") || u.includes("dolphin") ||
      u.includes("nuance") || u.includes("sorenson") || u.includes("audiodirections") ||
      u.includes("equidox") || u.includes("iowaschoolfortheblind") || 
      u.includes("iowaschoolforthedeaf")) {
    tags.add("at_specialist");
  }
  
  // Coach-focused resources
  if (u.includes("professional-learning") || u.includes("coaches") || u.includes("pd") ||
      u.includes("cast") || u.includes("udlcenter") || u.includes("247accessibledocuments") ||
      u.includes("equalweb") || u.includes("verbit")) {
    tags.add("coach");
  }
  
  // Multi-audience resources
  if (u.includes("centralriversaea.org")) { 
    tags.add("teacher"); 
    tags.add("coach"); 
  }
  
  if (u.includes("iowaaea.org") || u.includes("educate.iowa.gov")) { 
    tags.add("at_specialist"); 
  }
  
  // State AT Programs - useful for all roles
  if (u.includes("cttechact") || u.includes("dati") || u.includes("at4nj") ||
      u.includes("tap.gcd") || u.includes("traid-program") || u.includes("ncdhhs") ||
      u.includes("ndipat") || u.includes("atohio") || u.includes("okabletech") ||
      u.includes("accesstechnologiesinc") || u.includes("temple.edu") || 
      u.includes("atap.ri") || u.includes("sc.edu") || u.includes("dakotalink") ||
      u.includes("ttap.html") || u.includes("techaccess.edb")) {
    tags.add("teacher");
    tags.add("at_specialist");
    tags.add("coach");
  }
  
  // SETT Framework and foundational resources - useful for all roles
  if (u.includes("sett") || u.includes("joyzabala")) {
    tags.add("teacher");
    tags.add("at_specialist");
    tags.add("coach");
  }
  
  return Array.from(tags);
}

/**
 * Curated source URLs for the RAG system
 * Organized by category for maintainability
 */
export const SOURCES = [
  // --- Category 1: SETT Framework ---
  "https://www.joyzabala.com/links-resources",
  "https://sites.google.com/aea9.k12.ia.us/mbaeaatdept/sett-framework",
  "https://mn.gov/admin/at/learning/prek-12/sett-framework.jsp",

  // --- Category 2: Comprehensive AT Resources ---
  "https://www.edutopia.org/article/free-assistive-tech-tools-support-academic-success/",
  "https://www.education.uw.edu/tlh/assistive-technology/assistive-technology-links/",
  "https://www.teachingchannel.com/k12-hub/blog/assistive-technology-tools-for-your-classroom/",
  "https://www.readingrockets.org/topics/assistive-technology",
  "https://www.ldonline.org/ld-topics/assistive-technology",
  "https://www.understood.org/en/school-learning/assistive-technology",
  "https://www.greatschools.org/gk/articles/assistive-technology/",
  "https://www.schools.nyc.gov/learning/special-education/programs-and-services/assistive-technology",

  // --- Category 3: Iowa Specific ---
  "https://educate.iowa.gov/pk-12/special-education/programs-services/assistive-technology",
  "https://iowaaea.org/community-partners/special-education-services/assistive-technology/",
  "https://www.centralriversaea.org/educators/special-education/assistive-technology/",

  // --- Category 4: AT Tools and Software ---
  "https://www.texthelp.com/en-us/products/read-write/",
  "https://www.donjohnston.com/cowriter/",
  "https://www.kurzweiledu.com/products/kurzweil-3000.html",
  "https://www.cricksoft.com/us/clicker",
  "https://www.ghotit.com/",
  "https://goqsoftware.com/wordq/",
  "https://www.naturalreaders.com/",
  "https://www.voicedream.com/",
  "https://www.bookshare.org/",
  "https://learningally.org/",

  // --- Category 5: Research and Best Practices ---
  "https://www.atia.org/",
  "https://www.frontiersin.org/journals/education",
  "https://www.researchgate.net/topic/Assistive-Technology",

  // --- Category 6: Top-Tier AT Organizations & Agencies ---
  "https://www.cast.org/",
  "https://udlcenter.org/",
  "https://www.resna.org/",
  "https://at3center.net/",
  "https://www.ataprogram.org/",
  "https://www.joyzabala.com/",
  "https://www.icater.org/",
  "https://www.infinitec.org/",
  "https://www.inglis.org/",
  "https://www.boundlessat.com/",
  "https://www.texthelp.com/",
  "https://www.dolphin.com/",
  "https://www.nuance.com/dragon.html",
  "https://www.sorenson.com/",
  "https://www.247accessibledocuments.com/",
  "https://www.equalweb.com/",
  "https://verbit.ai/",
  "https://www.audiodirections.com/",
  "https://www.equidox.com/",

  // --- Category 7: State AT Programs (Top States) ---
  "https://www.cttechact.com/",
  "https://www.dati.org/",
  "https://at4nj.org/",
  "https://www.tap.gcd.state.nm.us/",
  "https://www.justicecenter.ny.gov/traid-program",
  "https://www.ncdhhs.gov/divisions/vocational-rehabilitation-services/north-carolina-assistive-technology-program",
  "https://www.ndipat.org/",
  "https://www.atohio.org/",
  "https://www.okabletech.org/",
  "https://www.accesstechnologiesinc.org/",
  "https://www.temple.edu/instituteondisabilities/",
  "https://www.atap.ri.gov/",
  "https://www.sc.edu/scatp",
  "https://www.dakotalink.net/",
  "https://www.tn.gov/humanservices/ds/ttap.html",
  "https://techaccess.edb.utexas.edu/",

  // --- Category 8: Educational AT Centers ---
  "https://www.helenkeller.org/",
  "https://www.leanderisd.org/",
  "https://www.morainepark.edu/",
  "https://www.uis.edu/",
  "https://www.iowaschoolfortheblind.org/",
  "https://www.iowaschoolforthedeaf.org/",
];

/**
 * Fetch and parse a single URL
 */
async function fetchAndParse(url: string): Promise<{
  title: string;
  content: string;
}> {
  console.log(`  Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TechBridge-AT-Bot/1.0; +https://techbridge-learning.example.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse with Readability for clean content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // Fallback to cheerio if Readability fails
    const $ = cheerio.load(html);
    const title = article?.title || $("title").text() || url;
    const content =
      article?.textContent || $("body").text() || "No content extracted";

    return {
      title: title.trim(),
      content: normalizeText(content),
    };
  } catch (error) {
    console.error(`  ✗ Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * Ingest a single document
 */
async function ingestDocument(url: string): Promise<void> {
  try {
    const { title, content } = await fetchAndParse(url);
    console.log(`  ✓ Parsed: ${title}`);

    // Upsert document with audience tags
    const audiences = inferAudiences(url);
    const docId = await upsertDocument(url, title, audiences);

    // Delete old chunks (if re-indexing)
    await deleteDocumentChunks(docId);

    // Chunk the content
    const chunks = chunk(content, 800, 200);
    console.log(`  → Chunking into ${chunks.length} parts`);

    // Embed and store each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await embed(chunkContent);
      await insertChunk(docId, i, chunkContent, embedding);

      // Progress indicator
      if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
        console.log(`    Embedded ${i + 1}/${chunks.length} chunks`);
      }
    }

    console.log(`  ✓ Indexed: ${url}\n`);
  } catch (error) {
    console.error(`  ✗ Failed to ingest ${url}:`, error);
    // Continue with other documents
  }
}

/**
 * Main ingestion function
 * Processes all sources and indexes them
 */
export async function ingest(): Promise<void> {
  console.log("🚀 Starting ingestion pipeline...\n");
  console.log(`Sources to process: ${SOURCES.length}\n`);

  const startTime = Date.now();

  for (let i = 0; i < SOURCES.length; i++) {
    console.log(`[${i + 1}/${SOURCES.length}]`);
    await ingestDocument(SOURCES[i]);

    // Rate limiting: wait 1s between requests
    if (i < SOURCES.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Ingestion complete in ${duration}s`);
}

/**
 * Re-index a specific URL (useful for updates)
 */
export async function reindexUrl(url: string): Promise<void> {
  console.log(`🔄 Re-indexing: ${url}`);
  await ingestDocument(url);
  console.log("✅ Re-index complete");
}

