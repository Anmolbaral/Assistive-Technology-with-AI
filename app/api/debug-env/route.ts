import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  // Mask the password for security
  const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'NOT_FOUND';
  
  return NextResponse.json({
    hasDatabaseURL: !!dbUrl,
    urlLength: dbUrl ? dbUrl.length : 0,
    urlStart: dbUrl ? dbUrl.substring(0, 30) : 'N/A',
    urlEnd: dbUrl ? dbUrl.substring(dbUrl.length - 30) : 'N/A',
    maskedUrl: maskedUrl,
    // Parse the URL to see what's wrong
    parsedUrl: dbUrl ? (() => {
      try {
        const url = new URL(dbUrl);
        return {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          username: url.username,
          pathname: url.pathname
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    })() : null
  });
}
