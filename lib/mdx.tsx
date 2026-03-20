/**
 * MDX Provider & Component Mapping
 * Maps MDX content to React components
 */

import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { DragDrop } from "@/components/lessons/DragDrop";
import { PromptPractice } from "@/components/lessons/PromptPractice";
import { InfoCard } from "@/components/content/InfoCard";
import { Video } from "@/components/content/Video";
import { Objectives } from "@/components/lessons/Objectives";
import { ComparisonTable, FeatureGrid, ProcessSteps, ProsConsCard } from "@/components/content/ComparisonTable";
import { IconGrid } from "@/components/content/IconGrid";
import { Scenario, LessonTakeaways, ReflectionPrompt } from "@/components/content/MdxLessonBlocks";
import { PromptTry } from "@/components/content/PromptTry";
import { Shield, Lightbulb, AlertCircle, Info } from "lucide-react";

/**
 * MDX component mapping
 * These components are available in all MDX files
 */
export const mdxComponents = {
  Quiz: LessonQuiz,
  DragDrop,
  PromptPractice,
  InfoCard,
  Video,
  Objectives,
  ComparisonTable,
  FeatureGrid,
  ProcessSteps,
  ProsConsCard,
  IconGrid,
  Scenario,
  LessonTakeaways,
  ReflectionPrompt,
  PromptTry,
  // Add icons for InfoCard
  Shield,
  Lightbulb,
  AlertCircle,
  Info,
  // Style enhancements
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mb-6 mt-8" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-semibold mb-4 mt-8" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mb-3 mt-6" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-xl font-semibold mb-2 mt-4" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-7" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      className="text-primary underline hover:text-primary/80 transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-muted p-4 rounded-lg overflow-x-auto mb-4"
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-border" {...props} />
  ),
};

