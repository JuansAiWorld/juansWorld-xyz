import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/auth';
import { verifyUserPassword, updateUserLastLogin } from '@/lib/users';
import { recordLoginEvent } from '@/lib/login-log';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const username = (data.username || '').trim();
    const password = data.password || '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const valid = await verifyUserPassword(username, password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionToken = createSession(username);
    const cookieStore = await cookies();

    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Record login event and update last login timestamp
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    await Promise.all([
      updateUserLastLogin(username),
      recordLoginEvent({
        username,
        action: 'login',
        timestamp: new Date().toISOString(),
        ip: ip.split(',')[0].trim(),
        userAgent,
      }),
    ]);

    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
