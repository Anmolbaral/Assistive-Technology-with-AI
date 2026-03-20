/**
 * Training Progress API
 * Records quiz completion per lesson and sets training-complete cookie when all 4 are done
 */

import { NextRequest, NextResponse } from "next/server";
import {
  LESSON_SLUGS,
  type LessonSlug,
} from "@/lib/completion";
import {
  parseProgressCookie,
  createProgressCookieValue,
  createCompleteCookieValue,
  isAllComplete,
  PROGRESS_COOKIE,
  COMPLETE_COOKIE,
} from "@/lib/completion-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year for progress
};

const COMPLETE_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 60 * 60 * 24, // 24 hours
};

/**
 * POST /api/progress
 * Body: { slug: LessonSlug, quizPassed: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, quizPassed } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'slug' parameter" },
        { status: 400 }
      );
    }

    if (!LESSON_SLUGS.includes(slug as LessonSlug)) {
      return NextResponse.json(
        { error: "Invalid lesson slug" },
        { status: 400 }
      );
    }

    if (typeof quizPassed !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid 'quizPassed' parameter" },
        { status: 400 }
      );
    }

    const progress = parseProgressCookie(req.cookies);
    progress[slug] = { completed: true, quizPassed };

    const response = NextResponse.json({ ok: true, progress });

    response.cookies.set(PROGRESS_COOKIE, createProgressCookieValue(progress), COOKIE_OPTIONS);

    if (isAllComplete(progress)) {
      response.cookies.set(
        COMPLETE_COOKIE,
        createCompleteCookieValue(),
        COMPLETE_COOKIE_OPTIONS
      );
    }

    return response;
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { error: "Failed to record progress" },
      { status: 500 }
    );
  }
}
