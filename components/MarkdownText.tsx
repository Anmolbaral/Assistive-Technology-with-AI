"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Chart } from "./Chart";
import type { Components } from "react-markdown";

interface ChartBlock {
  type: "bar" | "pie" | "line";
  title: string;
  data: { label: string; value: number; color?: string }[];
}

const CHART_PLACEHOLDER_RE = /<!--chart-(\d+)-->/;

/**
 * Extract custom ```chart:type blocks from raw text, replacing them
 * with HTML comment placeholders that survive the markdown parser.
 */
function extractCharts(text: string): { cleaned: string; charts: ChartBlock[] } {
  const charts: ChartBlock[] = [];
  const cleaned = text.replace(
    /```chart:(\w+)\n([\s\S]*?)```/g,
    (_match, chartType: string, body: string) => {
      const data: ChartBlock["data"] = [];
      let title = "";

      for (const line of body.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("title:")) {
          title = trimmed.replace("title:", "").trim();
        } else if (trimmed.includes(":")) {
          const parts = trimmed.split(":");
          if (parts.length >= 2) {
            data.push({
              label: parts[0].trim(),
              value: parseFloat(parts[1].trim()) || 0,
              color: parts[2]?.trim() || undefined,
            });
          }
        }
      }

      const idx = charts.length;
      charts.push({ type: chartType as ChartBlock["type"], title: title || "Chart", data });
      return `\n\n<!--chart-${idx}-->\n\n`;
    }
  );

  return { cleaned, charts };
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold mt-6 mb-3 text-foreground">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc list-outside mb-4 space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside mb-4 space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="mb-2">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-primary/80 underline transition-colors font-medium"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/20 pl-4 py-2 mb-4 bg-muted/30 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border rounded-lg">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-4 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-4 py-2">{children}</td>
  ),
  tr: ({ children }) => <tr className="hover:bg-muted/50">{children}</tr>,
  img: ({ src, alt }) => (
    <span className="block my-6">
      <img
        src={src}
        alt={alt || "Image"}
        className="max-w-full h-auto rounded-lg border shadow-sm"
        loading="lazy"
      />
      {alt && (
        <span className="block text-sm text-muted-foreground mt-2 text-center italic">
          {alt}
        </span>
      )}
    </span>
  ),
  pre: ({ children }) => (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm">{children}</pre>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return <code className="text-sm">{children}</code>;
    }
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    );
  },
};

export function MarkdownText({ text }: { text: string }) {
  const { cleaned, charts } = extractCharts(text);

  if (charts.length === 0) {
    return (
      <div className="space-y-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {cleaned}
        </ReactMarkdown>
      </div>
    );
  }

  // Split on chart placeholders and interleave markdown + charts
  const segments = cleaned.split(/(<!--chart-\d+-->)/);
  return (
    <div className="space-y-2">
      {segments.map((segment, idx) => {
        const chartMatch = segment.match(CHART_PLACEHOLDER_RE);
        if (chartMatch) {
          const chartIdx = parseInt(chartMatch[1], 10);
          const chart = charts[chartIdx];
          if (chart && chart.data.length > 0) {
            return <Chart key={`chart-${idx}`} title={chart.title} data={chart.data} type={chart.type} />;
          }
          return null;
        }
        const trimmed = segment.trim();
        if (!trimmed) return null;
        return (
          <ReactMarkdown key={`md-${idx}`} remarkPlugins={[remarkGfm]} components={components}>
            {trimmed}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
