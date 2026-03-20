/**
 * Server-side training completion verification
 * Verifies signed cookies set by /api/progress
 */

import crypto from "crypto";
import { LESSON_SLUGS, type LessonSlug } from "./completion";

const PROGRESS_COOKIE = "training-progress";
const COMPLETE_COOKIE = "training-complete";
const COMPLETE_EXPIRY_HOURS = 24;

function getSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("COOKIE_SECRET is required in production");
  }
  return secret || "dev-secret-do-not-use-in-production";
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function verify(payload: string, signature: string): boolean {
  const expected = sign(payload);
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export interface ProgressPayload {
  [slug: string]: { completed: boolean; quizPassed: boolean };
}

export interface CompletePayload {
  exp: number;
  v: number;
}

/**
 * Verify the training-complete cookie is valid and not expired
 */
export function verifyTrainingComplete(
  cookies: { get: (name: string) => { value: string } | undefined }
): boolean {
  const cookie = cookies.get(COMPLETE_COOKIE);
  if (!cookie?.value) return false;

  const [payloadB64, signature] = cookie.value.split(".");
  if (!payloadB64 || !signature) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as CompletePayload;
    if (!verify(payloadB64, signature)) return false;
    if (payload.exp && payload.exp < Date.now() / 1000) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a signed training-complete cookie value
 */
export function createCompleteCookieValue(): string {
  const exp = Math.floor(Date.now() / 1000) + COMPLETE_EXPIRY_HOURS * 3600;
  const payload: CompletePayload = { exp, v: 1 };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Parse and verify the training-progress cookie
 */
export function parseProgressCookie(
  cookies: { get: (name: string) => { value: string } | undefined }
): ProgressPayload {
  const cookie = cookies.get(PROGRESS_COOKIE);
  if (!cookie?.value) return {};

  const [payloadB64, signature] = cookie.value.split(".");
  if (!payloadB64 || !signature) return {};

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as ProgressPayload;
    if (!verify(payloadB64, signature)) return {};
    return payload;
  } catch {
    return {};
  }
}

/**
 * Create a signed training-progress cookie value
 */
export function createProgressCookieValue(progress: ProgressPayload): string {
  const payloadB64 = Buffer.from(JSON.stringify(progress), "utf8").toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Check if all lessons are complete in progress payload
 */
export function isAllComplete(progress: ProgressPayload): boolean {
  return LESSON_SLUGS.every(
    (slug) => progress[slug]?.completed && progress[slug]?.quizPassed
  );
}

export { PROGRESS_COOKIE, COMPLETE_COOKIE, type LessonSlug };
