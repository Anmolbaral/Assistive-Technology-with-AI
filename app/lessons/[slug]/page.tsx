import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLessonBySlug, getNextLesson, getPreviousLesson } from "@/lib/lessons";
import { mdxComponents } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { loadLessonContent } from "@/lib/loadLesson";
import Link from "next/link";
import { LessonClient } from "./lesson-client";

export default async function LessonPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const lesson = getLessonBySlug(slug);
  
  if (!lesson) {
    notFound();
  }

  const nextLesson = getNextLesson(slug);
  const prevLesson = getPreviousLesson(slug);

  // Load MDX content server-side
  let content: string;
  try {
    content = await loadLessonContent(slug);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">Lesson {lesson.order}</li>
        </ol>
      </nav>

      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge>Lesson {lesson.order} of 4</Badge>
          <Badge variant="outline">{lesson.duration}</Badge>
        </div>
        <h1 className="text-4xl font-bold">{lesson.title}</h1>
      </div>

      {/* Client-side wrapper for completion tracking */}
      <LessonClient slug={slug} />

      {/* Lesson Content */}
      <article className="prose prose-slate max-w-none mb-12">
        <MDXRemote source={content} components={mdxComponents} />
      </article>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t">
        {prevLesson ? (
          <Button variant="outline" asChild>
            <Link href={`/lessons/${prevLesson.slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        )}

        {nextLesson ? (
          <Button asChild>
            <Link href={`/lessons/${nextLesson.slug}`}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="success" asChild>
            <Link href="/complete">
              Complete Training
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

