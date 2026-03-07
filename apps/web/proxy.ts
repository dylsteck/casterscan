import { logger } from "@/app/lib/axiom/server";
import { transformMiddlewareRequest } from "@axiomhq/nextjs";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  try {
    logger.info(...transformMiddlewareRequest(request));
    event.waitUntil(logger.flush());
  } catch (error) {
    console.warn('Axiom middleware logging failed:', error);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
