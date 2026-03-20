import type { ReactNode } from "react";

/**
 * Hypothetical classroom vignette (no real PII).
 */
export function Scenario({
  title = "Classroom scenario",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside
      className="rounded-xl border border-primary/25 bg-primary/[0.06] p-5 my-8 not-prose"
      aria-label="Classroom scenario"
    >
      <p className="text-sm font-semibold text-primary mb-2">{title}</p>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </aside>
  );
}

/**
 * Printable checklist-style takeaways at end of lesson.
 */
export function LessonTakeaways({ items }: { items: string[] }) {
  return (
    <div
      className="rounded-xl border border-border bg-muted/40 p-5 my-10 not-prose print:break-inside-avoid"
      aria-label="Lesson takeaways"
    >
      <h3 className="text-base font-semibold text-foreground mb-3">
        Lesson takeaways <span className="font-normal text-muted-foreground">(print-friendly)</span>
      </h3>
      <ul className="list-none space-y-2 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary font-bold shrink-0" aria-hidden>
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Optional PD reflection — not stored; for discussion or a personal journal.
 */
export function ReflectionPrompt({ children }: { children: ReactNode }) {
  return (
    <div
      className="border-l-4 border-primary/40 pl-4 my-8 py-1 not-prose text-sm text-muted-foreground"
      role="note"
    >
      <span className="font-semibold text-foreground">Reflection: </span>
      {children}
    </div>
  );
}
