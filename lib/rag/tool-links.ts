/**
 * Common AT Tool Links
 * Provides valid URLs for frequently recommended tools
 * Use this to ensure consistent, valid links in AI responses
 */

export const AT_TOOL_LINKS: Record<string, string> = {
  // Low-Tech Tools
  "Graphic organizers": "https://www.edutopia.org/article/free-graphic-organizer-templates/",
  "Mind maps": "https://www.mindmapping.com/mind-map",
  "Venn diagrams": "https://www.canva.com/graphs/venn-diagrams/",
  "Pencil grips": "https://www.therapro.com/browse/category/pencil-grips/",
  "Highlighters": "https://www.readingrockets.org/topics/comprehension/articles/using-highlighters-improve-reading-comprehension",
  "Raised line paper": "https://www.readwritethink.org/classroom-resources/printouts/line-paper-30111.html",
  
  // Mid-Tech Tools
  "Google Voice Typing": "https://support.google.com/docs/answer/4492226",
  "Read&Write for Google Chrome": "https://www.texthelp.com/en-us/products/read-write/",
  "Co:Writer Universal Extension": "https://www.donjohnston.com/cowriter/",
  "Lucidchart": "https://www.lucidchart.com/",
  "Padlet": "https://padlet.com/",
  "Google Docs": "https://docs.google.com/",
  "Google Keep": "https://keep.google.com/",
  "Natural Reader": "https://www.naturalreaders.com/",
  "Voice Dream Reader": "https://www.voicedream.com/",
  "Bookshare": "https://www.bookshare.org/",
  "Learning Ally": "https://learningally.org/",
  "Immersive Reader": "https://www.microsoft.com/en-us/edge/features/immersive-reader",
  
  // High-Tech Tools
  "Grammarly": "https://www.grammarly.com/",
  "Kami": "https://www.kamiapp.com/",
  "Kurzweil 3000": "https://www.kurzweiledu.com/products/kurzweil-3000.html",
  "Dragon NaturallySpeaking": "https://www.nuance.com/dragon.html",
  "Ghotit": "https://www.ghotit.com/",
  "WordQ": "https://goqsoftware.com/wordq/",
  "Clicker": "https://www.cricksoft.com/us/clicker",
  
  // Apps & Extensions
  "Snap&Read": "https://www.texthelp.com/en-us/products/snapverter/",
  "Microsoft OneNote": "https://www.microsoft.com/en-us/microsoft-365/onenote/",
  "Notability": "https://notability.com/",
  "GoodNotes": "https://www.goodnotes.com/",
  "Speech Central": "https://www.speechcentral.net/",
  "Voice Dream Scanner": "https://www.voicedream.com/scanner/",
};

/**
 * Add hyperlinks to tool names in text
 * Usage: linkifyTools("Try Google Voice Typing or Grammarly")
 * Returns: markdown with links
 */
export function linkifyTools(text: string): string {
  let result = text;
  
  // Sort by length (descending) to match longer phrases first
  const sortedTools = Object.keys(AT_TOOL_LINKS).sort((a, b) => b.length - a.length);
  
  for (const tool of sortedTools) {
    const link = AT_TOOL_LINKS[tool];
    // Create markdown link, case-insensitive match
    const regex = new RegExp(`\\b(${tool})\\b`, "gi");
    result = result.replace(regex, `[$1](${link})`);
  }
  
  return result;
}

/**
 * Get link for a specific tool
 */
export function getToolLink(toolName: string): string | undefined {
  return AT_TOOL_LINKS[toolName];
}

/**
 * Common AT tool categories with links
 */
export const TOOL_CATEGORIES = {
  "Low-Tech": [
    { name: "Graphic organizers on paper", url: "https://www.edutopia.org/article/free-graphic-organizer-templates/" },
    { name: "Mind maps", url: "https://www.mindmapping.com/mind-map" },
    { name: "Venn diagrams", url: "https://www.canva.com/graphs/venn-diagrams/" },
    { name: "Pencil grips", url: "https://www.therapro.com/browse/category/pencil-grips/" },
    { name: "Highlighters and sticky notes", url: "https://www.readingrockets.org/topics/comprehension/articles/using-highlighters-improve-reading-comprehension" },
  ],
  "Mid-Tech": [
    { name: "Lucidchart", url: "https://www.lucidchart.com/" },
    { name: "Padlet", url: "https://padlet.com/" },
    { name: "Google Docs templates", url: "https://docs.google.com/document/u/0/?ftv=1&tgif=d" },
    { name: "Read&Write for Google Chrome", url: "https://www.texthelp.com/en-us/products/read-write/" },
    { name: "Natural Reader", url: "https://www.naturalreaders.com/" },
  ],
  "High-Tech": [
    { name: "Google Docs (with built-in templates)", url: "https://docs.google.com/" },
    { name: "Grammarly", url: "https://www.grammarly.com/" },
    { name: "Kami", url: "https://www.kamiapp.com/" },
    { name: "Kurzweil 3000", url: "https://www.kurzweiledu.com/products/kurzweil-3000.html" },
  ],
};

