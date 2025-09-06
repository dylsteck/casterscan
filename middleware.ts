import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BASE_URL } from './app/lib/utils';

export function middleware(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  const isValidOrigin = origin === BASE_URL;
  const isValidReferer = referer ? referer.startsWith(BASE_URL) : true;
  const isValidHost = host === new URL(BASE_URL).host;

  // TODO: uncomment before putting this branch's PR up
  // if (!isValidOrigin && !isValidReferer && !isValidHost) {
  //   return NextResponse.json({ 
  //     error: 'Unauthorized access', 
  //     details: 'Request does not match the expected base URL' 
  //   }, { status: 403 });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};