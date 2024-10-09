import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BASE_URL } from './app/lib/consts';

export function middleware(request: NextRequest) {
  const origin = request.nextUrl.origin || request.headers.get('origin') || request.headers.get('referer');
  const referer = request.headers.get('referer');

  if (origin && origin !== BASE_URL) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  if (!referer || !referer.startsWith(BASE_URL)) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};