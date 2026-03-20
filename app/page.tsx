"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Lock,
  BookOpen,
  Target,
  Sparkles,
  ListOrdered,
  ClipboardCheck,
  MessageSquareText,
} from "lucide-react";
import { lessons } from "@/lib/lessons";
import RolePicker from "@/components/roles/RolePicker";
import RoleSelectionDialog from "@/components/roles/RoleSelectionDialog";
import { useRole } from "@/lib/useRole";
import {
  isLessonComplete,
  getCompletionPercentage,
  TRAINING_PROGRESS_EVENT,
  type LessonSlug,
} from "@/lib/completion";

export default function HomePage() {
  const [, cfg] = useRole();
  const [mounted, setMounted] = useState(false);
  const [pct, setPct] = useState(0);
  const [completeMap, setCompleteMap] = useState<Record<string, boolean>>({});

  const refreshProgress = useCallback(() => {
    const map: Record<string, boolean> = {};
    for (const l of lessons) {
      map[l.slug] = isLessonComplete(l.slug as LessonSlug);
    }
    setCompleteMap(map);
    setPct(getCompletionPercentage());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshProgress();
    const onUpdate = () => refreshProgress();
    window.addEventListener(TRAINING_PROGRESS_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(TRAINING_PROGRESS_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refreshProgress]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl pb-24 md:pb-10">
      <RoleSelectionDialog />

      {/* Hero — value first */}
      <section className="text-center mb-12" aria-labelledby="hero-heading">
        <p className="text-sm text-muted-foreground mb-3 max-w-xl mx-auto">
          ~25 minutes · any device · no account required
        </p>
        <h1 id="hero-heading" className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
          AI for assistive technology,
          <br />
          <span className="text-primary">the privacy-first way</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Short, practical training for K–12 educators: use AI to find AT resources faster—without putting
          student data at risk.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="xl" asChild>
            <Link href={`/lessons/${lessons[0].slug}`}>
              <BookOpen className="mr-2 h-5 w-5" />
              Start Lesson 1
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/assistant">Open AT assistant</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-14" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-heading text-2xl font-bold text-center mb-8">
          How it works
        </h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none">
          {[
            {
              step: 1,
              title: "Learn",
              body: "Four short lessons with examples you can use tomorrow.",
              icon: BookOpen,
            },
            {
              step: 2,
              title: "Check",
              body: "Pass each knowledge check to show you’re ready.",
              icon: ClipboardCheck,
            },
            {
              step: 3,
              title: "Unlock",
              body: "Complete all four to open the curated AT assistant.",
              icon: Lock,
            },
            {
              step: 4,
              title: "Ask",
              body: "Query with SETT-style prompts and cited sources.",
              icon: MessageSquareText,
            },
          ].map(({ step, title, body, icon: Icon }) => (
            <li key={step}>
              <Card className="h-full border-primary/15 bg-primary/[0.03]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold">
                      {step}
                    </span>
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className="font-semibold">{title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Role personalization */}
      <section className="mb-14 rounded-2xl border bg-muted/30 p-6 md:p-8" aria-labelledby="role-heading">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
          <div>
            <h2 id="role-heading" className="font-heading text-xl font-bold mb-1">
              Personalize your experience
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Your role helps us tune example questions and resources. We never ask for student names or
              IDs—keep every query generic to stay FERPA/COPPA safe.
            </p>
          </div>
          <RolePicker />
        </div>
        {mounted ? (
          <p className="text-base font-medium text-foreground whitespace-pre-line border-t border-border/60 pt-4">
            {cfg.banner}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground border-t border-border/60 pt-4">Loading preferences…</p>
        )}
      </section>

      {/* Example queries */}
      <section aria-label="Example queries" className="mb-12">
        <h2 className="font-heading text-xl font-semibold mb-2">Example queries</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tap to copy and try in the AT assistant (after training, you’ll get the richest answers).
        </p>
        <div className="flex flex-wrap gap-2">
          {cfg.sampleQueries.map((q, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-left h-auto py-2 px-3 max-w-full"
              onClick={() => {
                void navigator.clipboard.writeText(q);
                window.location.href = "/assistant";
              }}
              title="Copy and open AT assistant"
            >
              <span className="line-clamp-3">{q}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Resources with blurbs */}
      <section className="mb-16" aria-label="Recommended resources">
        <h2 className="font-heading text-xl font-semibold mb-4">Resources picked for your role</h2>
        <ul className="grid md:grid-cols-2 gap-3">
          {cfg.resources.map((r, idx) => (
            <li key={idx} className="border rounded-xl p-4 hover:bg-muted/40 transition-colors">
              <a
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.title}
              </a>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Pillars */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardContent className="pt-6">
            <Lock className="h-10 w-10 text-primary mb-3" aria-hidden />
            <h3 className="font-heading font-semibold mb-2">Privacy-first</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No student data is collected, stored, or shared. Built for real district expectations.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Target className="h-10 w-10 text-primary mb-3" aria-hidden />
            <h3 className="font-heading font-semibold mb-2">SETT-shaped prompts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Learn to describe Student, Environment, Tasks, and Tools so answers match your context.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Clock className="h-10 w-10 text-primary mb-3" aria-hidden />
            <h3 className="font-heading font-semibold mb-2">About 25 minutes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Four bite-sized modules at your pace—then the assistant with citations from vetted sources.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Learning objectives */}
      <section className="mb-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <ListOrdered className="h-6 w-6 text-primary" aria-hidden />
              What you&apos;ll learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Benefits and limits of AI for AT resource discovery",
                "Writing effective prompts using the SETT framework",
                "Protecting student privacy (FERPA/COPPA mindset)",
                "Using AI as one step in AT decision-making—not the whole process",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" aria-hidden />
                  <span className="text-sm leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Training modules */}
      <section id="training-modules" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <h2 className="font-heading text-3xl font-bold">Training modules</h2>
          {mounted && pct > 0 ? (
            <Badge variant="secondary" className="w-fit">
              <Sparkles className="h-3 w-3 mr-1" aria-hidden />
              {pct}% complete
            </Badge>
          ) : null}
        </div>
        <div className="space-y-4">
          {lessons.map((lesson, idx) => {
            const done = mounted && completeMap[lesson.slug];
            return (
              <Card
                key={lesson.slug}
                className={`hover:shadow-md transition-shadow ${done ? "border-success/40 bg-success/[0.04]" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline">Lesson {lesson.order}</Badge>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" aria-hidden />
                          {lesson.duration}
                        </Badge>
                        {done ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" aria-hidden />
                            Done
                          </Badge>
                        ) : null}
                      </div>
                      <CardTitle className="font-heading text-xl mb-2">{lesson.title}</CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">{lesson.teaser}</p>
                    </div>
                    <Button asChild className="shrink-0">
                      <Link href={`/lessons/${lesson.slug}`}>
                        {idx === 0 ? "Start here" : done ? "Review" : "Open"}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-16 text-center">
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-8 pb-8">
            <h3 className="font-heading text-2xl font-bold mb-3">Ready when you are</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
              Finish all four lessons to unlock the AT assistant. Each module ends with a quick knowledge
              check.
            </p>
            <Button size="lg" asChild>
              <Link href={`/lessons/${lessons[0].slug}`}>Begin Lesson 1</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
