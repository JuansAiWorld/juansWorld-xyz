import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/auth';
import { verifyUserPassword } from '@/lib/users';

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

    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
