import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword, createSession, ADMIN_PASSWORD_HASH } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const username = (data.username || '').trim();
    const password = data.password || '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (ADMIN_PASSWORD_HASH) {
      const parts = ADMIN_PASSWORD_HASH.split(':');
      if (parts.length !== 2) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      const [salt, storedHash] = parts;
      if (!verifyPassword(password, salt, storedHash)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      if (password !== 'changeme123') {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
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

    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
