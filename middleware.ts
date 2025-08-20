import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BASE_URL } from './app/lib/utils';

export function middleware(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const userAgent = request.headers.get('user-agent');

  // Allow requests in development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Skip validation for EventSource connections (needed for streaming)
  if (userAgent?.includes('EventSource') || 
      request.headers.get('accept') === 'text/event-stream' ||
      request.headers.get('cache-control') === 'no-cache') {
    return NextResponse.next();
  }

  // More lenient validation for production
  const baseHost = new URL(BASE_URL).host;
  const isValidOrigin = origin === BASE_URL || origin.includes(baseHost);
  const isValidReferer = referer ? (referer.startsWith(BASE_URL) || referer.includes(baseHost)) : true;
  const isValidHost = host === baseHost || host?.includes('vercel.app') || host?.includes('casterscan.com');

  // Allow if any validation passes (less restrictive)
  if (isValidOrigin || isValidReferer || isValidHost) {
    return NextResponse.next();
  }

  // Only block if all validations fail and it's clearly suspicious
  return NextResponse.json({ 
    error: 'Unauthorized access', 
    details: 'Request does not match the expected base URL' 
  }, { status: 403 });
}

export const config = {
  matcher: '/api/:path*',
};