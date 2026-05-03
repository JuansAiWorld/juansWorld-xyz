import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';

export const dynamic = 'force-dynamic';

export async function GET() {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json(
      { authenticated: false, user: null, role: null },
      { status: 401 }
    );
  }

  const user = await findUser(username);
  if (!user) {
    return NextResponse.json(
      { authenticated: false, user: null, role: null },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: user.username,
    role: user.role,
    lastLoginAt: user.lastLoginAt || null,
  });
}
