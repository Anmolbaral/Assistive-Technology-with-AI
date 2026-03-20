/**
 * Integration test setup
 * Provides apiFetch helper with cookie jar for tests hitting the live server
 * Uses http/https for reliable Set-Cookie header access
 */

import "@testing-library/jest-dom/vitest";
import http from "http";
import https from "https";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const cookieJar = new Map<string, string>();

function parseSetCookie(header: string): { name: string; value: string } | null {
  const [nameValue] = header.split(";");
  if (!nameValue) return null;
  const eq = nameValue.indexOf("=");
  if (eq === -1) return null;
  return { name: nameValue.slice(0, eq).trim(), value: nameValue.slice(eq + 1).trim() };
}

function getCookieHeader(): string {
  return Array.from(cookieJar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

export function clearCookieJar(): void {
  cookieJar.clear();
}

interface ApiResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

export function apiFetch(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const urlStr = path.startsWith("http")
      ? path
      : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    let url: URL;
    try {
      url = new URL(urlStr);
    } catch (e) {
      reject(new Error(`Invalid URL: ${urlStr} (BASE_URL=${BASE_URL})`));
      return;
    }
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (options.headers) {
      const h = options.headers as Record<string, string>;
      for (const [k, v] of Object.entries(h)) {
        headers[k] = v;
      }
    }

    const cookieHeader = getCookieHeader();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const req = client.request(
      url.toString(),
      {
        method: options.method ?? "GET",
        headers,
      },
      (res) => {
        const setCookies = res.headers["set-cookie"];
        if (setCookies) {
          const arr = Array.isArray(setCookies) ? setCookies : [setCookies];
          for (const sc of arr) {
            const parsed = parseSetCookie(sc);
            if (parsed) {
              cookieJar.set(parsed.name, parsed.value);
            }
          }
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers as Record<string, string | string[] | undefined>,
            json: async () => {
              try {
                return JSON.parse(body);
              } catch {
                throw new Error(`Invalid JSON: ${body.slice(0, 100)}`);
              }
            },
            text: async () => body,
          });
        });
      }
    );

    req.on("error", reject);
    if (options.body) {
      req.write(
        typeof options.body === "string" ? options.body : JSON.stringify(options.body)
      );
    }
    req.end();
  });
}

export { BASE_URL };
