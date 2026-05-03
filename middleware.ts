import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || '';

async function verifySession(token: string): Promise<string | null> {
  const parts = token.split(':');
  if (parts.length !== 2) return null;

  const [username, signature] = parts;
  const expectedSig = await hmacSha256(`${username}:${SESSION_SECRET}`);

  if (signature === expectedSig.slice(0, 32)) {
    return username;
  }
  return null;
}

async function hmacSha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const PUBLIC_PATHS = ['/login.html', '/api/login', '/api/contact', '/api/keys', '/api/content'];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return false;
  }
  return pathname.startsWith('/flowpace') || pathname.startsWith('/api/flowpace');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session')?.value;
  const username = sessionToken ? await verifySession(sessionToken) : null;

  if (!username) {
    const loginUrl = new URL('/login.html', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/flowpace/:path*', '/api/flowpace/:path*'],
};
