# Valid Sources for AI Assistant

All sources displayed to users are verified and valid. The AI assistant only references content from these curated, authoritative sources.

## Current Source List

### SETT Framework Resources
1. **Joy Zabala - SETT Framework**
   - URL: https://www.joyzabala.com/links-resources
   - Description: Official SETT Framework resources from the creator
   - Status: ✅ Valid

2. **Mississippi Bend AEA - SETT Framework**
   - URL: https://sites.google.com/aea9.k12.ia.us/mbaeaatdept/sett-framework
   - Description: SETT Framework implementation guide
   - Status: ✅ Valid

3. **Minnesota AT - SETT Framework**
   - URL: https://mn.gov/admin/at/learning/prek-12/sett-framework.jsp
   - Description: State-level SETT Framework guidance
   - Status: ✅ Valid

### Free AT Tools & Resources
4. **Edutopia - Free Assistive Tech Tools**
   - URL: https://www.edutopia.org/article/free-assistive-tech-tools-support-academic-success/
   - Description: Comprehensive list of free AT tools for academic success
   - Status: ✅ Valid

5. **University of Michigan - AT Resources**
   - URL: https://ssd.umich.edu/article/assistive-technology-resources
   - Description: Higher education AT resources and tools
   - Status: ✅ Valid

6. **University of Washington - AT Links**
   - URL: https://www.education.uw.edu/tlh/assistive-technology/assistive-technology-links/
   - Description: Curated AT links and resources
   - Status: ✅ Valid

7. **Teaching Channel - AT Tools for Classroom**
   - URL: https://www.teachingchannel.com/k12-hub/blog/assistive-technology-tools-for-your-classroom/
   - Description: Practical AT tools for K-12 classrooms
   - Status: ✅ Valid

### Iowa-Specific Resources
8. **Iowa Department of Education - AT Programs**
   - URL: https://educate.iowa.gov/pk-12/special-education/programs-services/assistive-technology
   - Description: State-level AT programs and services
   - Status: ✅ Valid

9. **Iowa AEA - AT Services**
   - URL: https://iowaaea.org/community-partners/special-education-services/assistive-technology/
   - Description: Iowa AEA AT support services
   - Status: ✅ Valid

## How Sources Are Displayed

When users receive AI responses, sources are displayed at the bottom with:
- ✅ **Clickable links** (open in new tab)
- ✅ **Source title** (visible text)
- ✅ **Full URL** (shown below title)
- ✅ **External link icon** (visual indicator)
- ✅ **Hover effect** (better UX)

## Source Validation Process

1. **Vector Search**: Query is embedded and searched against indexed content
2. **Relevance Ranking**: Top 8 most relevant chunks are retrieved
3. **Source Extraction**: Unique sources are extracted from chunks
4. **LLM Context**: Sources are provided to LLM for citation
5. **User Display**: 2-6 most relevant sources are shown with clickable links

## Adding New Sources

To add new sources:
1. Add URL to `lib/rag/ingest.ts` → `SOURCES` array
2. Run ingestion: `npm run ingest`
3. Verify source is valid and accessible
4. Update this documentation

## Notes

- All URLs are validated during ingestion
- Failed URLs are logged but don't break the process
- Sources are automatically de-duplicated
- Only sources from indexed content are shown to users
- No placeholder or example.com URLs are used in production

