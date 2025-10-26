"use client";

import { Chart } from "./Chart";

/**
 * Enhanced markdown renderer for AI responses
 * Handles links, headers, bold text, lists, horizontal rules, images, and charts
 */
export function MarkdownText({ text }: { text: string }) {
  // Split text into lines for processing
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines
    if (line.trim() === '') {
      elements.push(<br key={key++} />);
      i++;
      continue;
    }

    // Headers (**Header**)
    if (line.startsWith('**') && line.endsWith('**')) {
      const headerText = line.slice(2, -2);
      elements.push(
        <h3 key={key++} className="text-lg font-semibold mt-6 mb-3 text-foreground">
          {renderInlineMarkdown(headerText)}
        </h3>
      );
      i++;
      continue;
    }

    // Horizontal rules (---)
    if (line.trim() === '---') {
      elements.push(<hr key={key++} className="my-6 border-border" />);
      i++;
      continue;
    }

    // List items (- item or 1. item) - group consecutive items
    if (line.match(/^\s*[-*]\s/) || line.match(/^\s*\d+\.\s/)) {
      const listItems: JSX.Element[] = [];
      let isNumberedList = false;
      
      // Collect consecutive list items
      while (i < lines.length && (lines[i].match(/^\s*[-*]\s/) || lines[i].match(/^\s*\d+\.\s/))) {
        const listLine = lines[i];
        const isNumbered = listLine.match(/^\s*\d+\.\s/);
        if (isNumbered) isNumberedList = true;
        
        const listText = listLine.replace(/^\s*[-*]\s/, '').replace(/^\s*\d+\.\s/, '');
        listItems.push(
          <li key={key++} className="mb-2">
            {renderInlineMarkdown(listText)}
          </li>
        );
        i++;
      }
      
      // Wrap in ul or ol
      const ListComponent = isNumberedList ? 'ol' : 'ul';
      const listClass = isNumberedList ? 'list-decimal list-inside mb-4 space-y-1' : 'list-disc list-inside mb-4 space-y-1';
      
      elements.push(
        <ListComponent key={key++} className={listClass}>
          {listItems}
        </ListComponent>
      );
      continue;
    }

    // Images (![alt](url))
    if (line.match(/^!\[.*\]\(.*\)$/)) {
      const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        elements.push(
          <div key={key++} className="my-6">
            <img 
              src={src} 
              alt={alt || 'Image'} 
              className="max-w-full h-auto rounded-lg border shadow-sm"
              loading="lazy"
              onError={(e) => {
                // Fallback for broken images
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'p-4 bg-muted rounded-lg text-center text-muted-foreground';
                fallback.textContent = `Image: ${alt || 'Visual content'}`;
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            {alt && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {alt}
              </p>
            )}
          </div>
        );
        i++;
        continue;
      }
    }

    // Charts (```chart:type)
    if (line.match(/^```chart:/)) {
      const chartType = line.replace('```chart:', '').trim();
      const chartData: any[] = [];
      let chartTitle = '';
      
      // Collect chart data until closing ```
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        const chartLine = lines[i];
        
        // Parse title
        if (chartLine.startsWith('title:')) {
          chartTitle = chartLine.replace('title:', '').trim();
        }
        // Parse data (label:value:color format)
        else if (chartLine.includes(':')) {
          const parts = chartLine.split(':');
          if (parts.length >= 2) {
            chartData.push({
              label: parts[0].trim(),
              value: parseFloat(parts[1].trim()) || 0,
              color: parts[2]?.trim() || undefined
            });
          }
        }
        i++;
      }
      
      if (chartData.length > 0) {
        elements.push(
          <Chart 
            key={key++} 
            title={chartTitle || 'Chart'} 
            data={chartData} 
            type={chartType as "bar" | "pie" | "line"} 
          />
        );
      }
      i++;
      continue;
    }

    // Tables (| col1 | col2 |)
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows: string[][] = [];
      
      // Collect table rows
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        const row = lines[i].split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        tableRows.push(row);
        i++;
      }
      
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const dataRows = tableRows.slice(1);
        
        elements.push(
          <div key={key++} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  {headers.map((header, idx) => (
                    <th key={idx} className="border border-border px-4 py-2 text-left font-semibold">
                      {renderInlineMarkdown(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-muted/50">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border border-border px-4 py-2">
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Quoted text (speech in scripts) - lines starting with quotes
    if (line.trim().startsWith('"') && line.trim().endsWith('"')) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-primary/20 pl-4 py-2 mb-4 bg-muted/30 italic">
          {renderInlineMarkdown(line.trim().slice(1, -1))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Regular paragraphs
    elements.push(
      <p key={key++} className="mb-4 leading-7">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-2">{elements}</div>;
}

/**
 * Render inline markdown (links, bold, italic)
 */
function renderInlineMarkdown(text: string): JSX.Element[] {
  const parts: Array<{ type: "text" | "link" | "bold" | "italic"; content: string; url?: string }> = [];
  let lastIndex = 0;

  // Process links first: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push({ type: "text", content: beforeText });
    }

    // Add the link
    parts.push({
      type: "link",
      content: match[1],
      url: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  // Process bold and italic in the text parts
  const processedParts: JSX.Element[] = [];
  let partKey = 0;

  for (const part of parts) {
    if (part.type === "link") {
      processedParts.push(
        <a
          key={partKey++}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline transition-colors font-medium"
        >
          {part.content}
        </a>
      );
    } else {
      // Process bold (**text**) and italic (*text*) in text content
      const textContent = part.content;
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const italicRegex = /\*([^*]+)\*/g;
      
      let processedText = textContent;
      let textKey = 0;

      // Replace bold text
      processedText = processedText.replace(boldRegex, (match, content) => {
        return `<strong>${content}</strong>`;
      });

      // Replace italic text
      processedText = processedText.replace(italicRegex, (match, content) => {
        return `<em>${content}</em>`;
      });

      processedParts.push(
        <span 
          key={partKey++} 
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
    }
  }

  return processedParts;
}


