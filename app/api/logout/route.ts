import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkAuth } from '@/lib/auth';
import { recordLoginEvent } from '@/lib/login-log';

export async function POST(request: Request) {
  const username = await checkAuth();

  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    expires: new Date(0),
  });

  // Record logout event if we know who was logged in
  if (username) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await recordLoginEvent({
      username,
      action: 'logout',
      timestamp: new Date().toISOString(),
      ip: ip.split(',')[0].trim(),
      userAgent,
    }).catch(() => {
      // Best-effort: don't fail logout if logging fails
    });
  }

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
