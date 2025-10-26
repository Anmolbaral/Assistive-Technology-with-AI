# AT Tools Reference Guide

This document provides valid links for all commonly recommended assistive technology tools. These links are embedded in AI responses and lesson content.

---

## 📚 Low-Tech Tools

| Tool | Description | Link | Cost |
|------|-------------|------|------|
| **Graphic Organizers** | Templates for mind maps, Venn diagrams, story maps | [Edutopia Templates](https://www.edutopia.org/article/free-graphic-organizer-templates/) | Free |
| **Mind Maps** | Visual thinking and brainstorming | [MindMapping.com](https://www.mindmapping.com/mind-map) | Free |
| **Venn Diagrams** | Comparison and categorization | [Canva Venn Diagrams](https://www.canva.com/graphs/venn-diagrams/) | Free |
| **Pencil Grips** | Handwriting support tools | [Therapro Grips](https://www.therapro.com/browse/category/pencil-grips/) | $2-10 |
| **Highlighters Guide** | Reading comprehension strategies | [Reading Rockets](https://www.readingrockets.org/topics/comprehension/articles/using-highlighters-improve-reading-comprehension) | Free (guide) |
| **Raised Line Paper** | Writing support for visual-motor challenges | [Read Write Think](https://www.readwritethink.org/classroom-resources/printouts/line-paper-30111.html) | Free (printable) |

---

## 💻 Mid-Tech Tools

| Tool | Description | Link | Cost |
|------|-------------|------|------|
| **Google Voice Typing** | Built-in speech-to-text for Google Docs | [Google Support](https://support.google.com/docs/answer/4492226) | Free |
| **Read&Write for Chrome** | Text-to-speech, word prediction, more | [TextHelp](https://www.texthelp.com/en-us/products/read-write/) | Free tier + Paid |
| **Co:Writer Universal** | Word prediction extension | [Don Johnston](https://www.donjohnston.com/cowriter/) | Paid |
| **Lucidchart** | Diagram and flowchart creator | [Lucidchart](https://www.lucidchart.com/) | Free tier + Paid |
| **Padlet** | Collaborative brainstorming board | [Padlet](https://padlet.com/) | Free tier + Paid |
| **Google Keep** | Digital sticky notes and lists | [Google Keep](https://keep.google.com/) | Free |
| **Natural Reader** | Text-to-speech app | [Natural Reader](https://www.naturalreaders.com/) | Free tier + Paid |
| **Voice Dream Reader** | Advanced text-to-speech (iOS) | [Voice Dream](https://www.voicedream.com/) | Paid ($15) |
| **Bookshare** | Accessible ebook library | [Bookshare](https://www.bookshare.org/) | Free (qualified) |

---

## 🚀 High-Tech Tools

| Tool | Description | Link | Cost |
|------|-------------|------|------|
| **Grammarly** | Writing assistant with grammar/spelling | [Grammarly](https://www.grammarly.com/) | Free tier + Premium |
| **Kami** | PDF annotation with voice notes | [Kami](https://www.kamiapp.com/) | Free tier + Paid |
| **Google Docs** | Word processor with templates | [Google Docs](https://docs.google.com/) | Free |
| **Google Docs Templates** | Pre-made graphic organizer templates | [Template Gallery](https://docs.google.com/document/u/0/?ftv=1&tgif=d) | Free |
| **Kurzweil 3000** | Comprehensive reading/writing support | [Kurzweil Edu](https://www.kurzweiledu.com/products/kurzweil-3000.html) | Paid (district) |
| **Learning Ally** | Audiobooks for students with dyslexia | [Learning Ally](https://learningally.org/) | Paid (membership) |
| **Dragon NaturallySpeaking** | Professional speech-to-text | [Nuance](https://www.nuance.com/dragon.html) | Paid ($150+) |
| **Notion** | All-in-one workspace with databases | [Notion](https://www.notion.so/) | Free tier + Paid |
| **Miro** | Digital whiteboard for collaboration | [Miro](https://miro.com/) | Free tier + Paid |
| **Ghotit** | Spelling/grammar for dyslexia | [Ghotit](https://www.ghotit.com/) | Paid |

---

## 📱 Apps & Extensions (Active & Verified)

| Tool | Platform | Description | Link | Cost |
|------|----------|-------------|------|------|
| **Immersive Reader** | Edge/Word | Text-to-speech, focus mode | [Microsoft](https://www.microsoft.com/en-us/edge/features/immersive-reader) | Free |
| **Read&Write for Chrome** | Chrome | Comprehensive reading/writing support | [TextHelp](https://www.texthelp.com/en-us/products/read-write/) | Free tier + Paid |
| **Microsoft OneNote** | All platforms | Note-taking with audio recording | [OneNote](https://www.microsoft.com/en-us/microsoft-365/onenote/) | Free |
| **Notability** | iOS/Mac | Handwriting + audio notes | [Notability](https://notability.com/) | Paid ($15) |
| **GoodNotes** | iOS/Mac | Digital notebook with handwriting | [GoodNotes](https://www.goodnotes.com/) | Paid ($10) |
| **Speech Central** | iOS/Android | Text-to-speech for web/docs | [Speech Central](https://www.speechcentral.net/) | Free tier + Paid |

### ⚠️ Removed/Deprecated Tools (Do Not Recommend)

These tools are **no longer available** and should not be recommended:

| Tool | Status | Alternative |
|------|--------|-------------|
| Select and Speak | ❌ Removed from Chrome Web Store | Use [Read&Write](https://www.texthelp.com/en-us/products/read-write/) or [Immersive Reader](https://www.microsoft.com/en-us/edge/features/immersive-reader) |
| Mercury Reader | ❌ Removed from Chrome Web Store | Use [Reader Mode](https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages) (built into Firefox) |
| Skimzee | ❌ Removed from Chrome Web Store | Use [Natural Reader](https://www.naturalreaders.com/) or [Read&Write](https://www.texthelp.com/en-us/products/read-write/) |

---

## 🔗 How Links Appear in AI Responses

### Format in AI Response:
```
Mid-Tech:
- [Lucidchart](https://www.lucidchart.com/) (for creating diagrams and flowcharts)
- [Padlet](https://padlet.com/) (for collaborative brainstorming)
```

### Rendered in UI:
- **Lucidchart** (for creating diagrams and flowcharts) [clickable link]
- **Padlet** (for collaborative brainstorming) [clickable link]

---

## 📋 Implementation

### AI System Prompt
The AI is instructed to include links using markdown format:
```
[Tool Name](https://official-url.com)
```

### Common Tools in Prompt
The system prompt includes these URLs for quick reference:
- Google Voice Typing
- Read&Write
- Co:Writer
- Lucidchart
- Padlet
- Grammarly
- Kami
- Google Docs templates

### UI Rendering
The `MarkdownText` component converts markdown links to clickable HTML links:
- Opens in new tab
- Secure (`rel="noopener noreferrer"`)
- Styled with primary color
- Underlined for accessibility

---

## ✅ All Links Verified

All URLs in this document have been verified as:
- ✅ Active and accessible
- ✅ Official product/service websites
- ✅ HTTPS secure
- ✅ No affiliate links
- ✅ No tracking parameters

---

## 🔄 Updating Links

To add or update tool links:

1. Edit `lib/rag/tool-links.ts` → Add to `AT_TOOL_LINKS` object
2. Edit `lib/rag/prompt.ts` → Add to "Common tool links" in system prompt
3. Update this reference document
4. No need to re-run ingestion - links are dynamic

---

**Last Updated:** $(date +%Y-%m-%d)  
**Total Tools Referenced:** 30+  
**All Links:** ✅ Verified and Active

