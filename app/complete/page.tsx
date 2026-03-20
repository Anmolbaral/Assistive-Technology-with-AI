"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Sparkles, Printer, ArrowRight, BookOpen } from "lucide-react";
import { isComplete, markComplete, getCompletionPercentage, LESSON_SLUGS } from "@/lib/completion";
import { lessons } from "@/lib/lessons";
import { analytics } from "@/lib/analytics";

export default function CompletePage() {
  const router = useRouter();
  const percentage = getCompletionPercentage();
  const allComplete = percentage === 100;

  useEffect(() => {
    if (allComplete && !isComplete()) {
      markComplete();
      analytics.trainingComplete();
    }
  }, [allComplete]);

  useEffect(() => {
    if (!allComplete) return;
    const sync = async () => {
      for (const slug of LESSON_SLUGS) {
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, quizPassed: true }),
            credentials: "include",
          });
        } catch (err) {
          console.warn("Progress sync failed:", err);
        }
      }
    };
    sync();
  }, [allComplete]);

  const handlePrint = () => {
    window.print();
  };

  if (!allComplete) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="pt-12 pb-12">
            <h1 className="font-heading text-3xl font-bold mb-4">Almost there</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You&apos;ve completed {percentage}% of the training. Finish all lessons and knowledge checks to
              unlock the AT assistant.
            </p>
            <Button size="lg" onClick={() => router.push("/#training-modules")}>
              Continue training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10 no-print">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-success/10 mb-5">
          <Award className="w-14 h-14 text-success" aria-hidden />
        </div>

        <h1 className="font-heading text-4xl font-bold mb-3">Congratulations!</h1>
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          You&apos;ve finished TechBridge Learning — AI &amp; AT training
        </p>

        <Badge variant="success" className="text-base px-4 py-2">
          <CheckCircle className="mr-2 h-4 w-4" aria-hidden />
          Privacy-first AI for AT resources
        </Badge>
      </div>

      <Card className="mb-6 no-print">
        <CardContent className="pt-6">
          <h2 className="font-heading text-2xl font-semibold mb-4">What you learned</h2>
          <ul className="space-y-3">
            {[
              {
                title: "Responsible AI use",
                detail: "Benefits, limits, and TechBridge’s privacy-first design",
              },
              {
                title: "Prompt engineering",
                detail: "SETT-shaped questions that surface better AT ideas",
              },
              {
                title: "Student privacy",
                detail: "FERPA/COPPA mindset and why PII never belongs in prompts",
              },
              {
                title: "SETT + AI",
                detail: "Using AI inside a full AT process—not skipping trials or documentation",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" aria-hidden />
                <div>
                  <strong className="block">{item.title}</strong>
                  <span className="text-sm text-muted-foreground">{item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Printable summary for PD records */}
      <Card
        id="completion-print-root"
        className="mb-8 border-2 border-primary/25 print:border-foreground print:shadow-none"
      >
        <CardContent className="pt-6 print:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="font-heading text-xl font-semibold">Completion summary</h2>
            <Button type="button" variant="outline" size="sm" className="no-print gap-2 shrink-0" onClick={handlePrint}>
              <Printer className="h-4 w-4" aria-hidden />
              Print summary
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4 print:text-foreground">
            For professional development documentation. TechBridge does not store your name—fill in the line
            below if your program requires it.
          </p>
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3 text-sm print:bg-transparent">
            <p>
              <span className="font-medium">Program:</span> TechBridge Learning — AI &amp; assistive technology
              training
            </p>
            <p>
              <span className="font-medium">Modules completed:</span> {lessons.length} ({lessons.map((l) => l.title).join("; ")})
            </p>
            <p>
              <span className="font-medium">Date printed:</span> {new Date().toLocaleDateString()}
            </p>
            <p className="pt-2 border-t border-border print:border-foreground/20">
              <span className="font-medium">Participant name (optional):</span>{" "}
              <span className="inline-block min-w-[12rem] border-b border-dotted border-foreground/40 print:border-foreground">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </p>
            <p className="text-xs text-muted-foreground print:text-foreground/80 pt-2">
              I confirm I completed the online modules and knowledge checks above. Signature: _________________________
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20 mb-8 no-print">
        <CardContent className="pt-8 pb-8 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden />
          <h2 className="font-heading text-2xl font-bold mb-2">AT assistant unlocked</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
            Ask privacy-safe, SETT-style questions and follow the citations to verify tools before you implement
            them.
          </p>
          <Button size="lg" asChild>
            <Link href="/assistant">
              Open AT assistant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="no-print">
        <CardContent className="pt-6">
          <h3 className="font-heading font-semibold mb-3">Suggested next actions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>Try one new query in the assistant using a prompt you drafted in Lessons 2 or 4.</li>
            <li>Share this training with a colleague or PLC—compare takeaways from Lesson 1.</li>
            <li>Bookmark the assistant for planning time; keep district AT consult channels in the loop.</li>
            <li>Skim a resource from your role list on the home page for deeper reading.</li>
          </ol>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 justify-center mt-10 no-print">
        <Button asChild size="lg">
          <Link href="/assistant">Open AT assistant</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" />
            Review lessons
          </Link>
        </Button>
      </div>
    </div>
  );
}
