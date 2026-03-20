"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type NavTarget = { href: string; label: string };

export function LessonNavBar({
  previous,
  next,
}: {
  previous: NavTarget;
  next: NavTarget | null;
}) {
  const isCompleteCta = next?.href.includes("/complete");

  return (
    <>
      <div className="hidden md:flex justify-between items-center pt-8 border-t gap-4">
        <Button variant="outline" asChild>
          <Link href={previous.href}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {previous.label}
          </Link>
        </Button>
        {next ? (
          <Button variant={isCompleteCta ? "success" : "default"} asChild>
            <Link href={next.href}>
              {next.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 backdrop-blur px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        role="navigation"
        aria-label="Lesson navigation"
      >
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={previous.href}>
            <ArrowLeft className="mr-1 h-4 w-4 shrink-0" />
            <span className="truncate">{previous.label}</span>
          </Link>
        </Button>
        {next ? (
          <Button variant={isCompleteCta ? "success" : "default"} size="sm" className="flex-1" asChild>
            <Link href={next.href}>
              <span className="truncate">{next.label}</span>
              <ArrowRight className="ml-1 h-4 w-4 shrink-0" />
            </Link>
          </Button>
        ) : (
          <span className="flex-1" />
        )}
      </div>
    </>
  );
}
