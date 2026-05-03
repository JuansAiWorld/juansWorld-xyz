import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'juansworld-local-dev-secret-key-do-not-use-in-prod';

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

const PUBLIC_PATHS = [
  '/login.html',
  '/api/login',
  '/api/logout',
  '/api/auth/me',
  '/api/contact',
  '/api/keys',
  '/api/content',
  '/',
  '/index.html',
  '/about.html',
  '/devops.html',
  '/legal.html',
  '/privacy.html',
  '/terms.html',
  '/sitemap.html',
  '/ask-juan.html',
  '/jp/',
  '/mx/',
  '/css/',
  '/js/',
  '/images/',
  '/favicon',
  '/_next/',
];

const PROTECTED_PATHS = [
  '/flowpace',
  '/api/flowpace',
  '/admin.html',
  '/reports.html',
  '/report.html',
  '/dashboard.html',
  '/stl.html',
  '/stls.html',
  '/diary.html',
  '/api/reports',
  '/api/report',
  '/api/content/upload',
  '/api/stls',
  '/api/keys',
  '/api/users',
  '/api/logins',
];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return false;
  }
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
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
  matcher: [
    '/flowpace/:path*',
    '/api/flowpace/:path*',
    '/admin.html',
    '/reports.html',
    '/report.html',
    '/dashboard.html',
    '/stl.html',
    '/stls.html',
    '/diary.html',
    '/api/reports/:path*',
    '/api/report/:path*',
    '/api/content/upload/:path*',
    '/api/stls/:path*',
    '/api/keys/:path*',
    '/api/users/:path*',
    '/api/logins/:path*',
    '/api/auth/:path*',
  ],
};
