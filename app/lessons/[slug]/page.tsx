import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { getLessonBySlug, getNextLesson, getPreviousLesson } from "@/lib/lessons";
import { mdxComponents } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { loadLessonContent } from "@/lib/loadLesson";
import Link from "next/link";
import { LessonClient } from "./lesson-client";
import { LessonNavBar } from "@/components/lessons/LessonNavBar";

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

  let content: string;
  try {
    content = await loadLessonContent(slug);
  } catch {
    notFound();
  }

  const previousNav = prevLesson
    ? { href: `/lessons/${prevLesson.slug}`, label: "Previous" }
    : { href: "/", label: "Back to home" };

  const nextNav = nextLesson
    ? { href: `/lessons/${nextLesson.slug}`, label: "Next lesson" }
    : { href: "/complete", label: "Complete training" };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-28 md:pb-8">
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/#training-modules" className="hover:text-primary transition-colors">
              Training
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">Lesson {lesson.order}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge>
            Lesson {lesson.order} of 4
          </Badge>
          <Badge variant="outline">{lesson.duration}</Badge>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-4">{lesson.title}</h1>
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardContent className="pt-5 pb-5">
            <div className="flex gap-3">
              <ListTodo className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">In this lesson</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{lesson.teaser}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <LessonClient slug={slug} />

      <article className="prose prose-slate max-w-none mb-6 md:mb-12">
        <MDXRemote source={content} components={mdxComponents} options={{ blockJS: false }} />
      </article>

      <LessonNavBar previous={previousNav} next={nextNav} />
    </div>
  );
}
