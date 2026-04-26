import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getUserLoginLog, getAllLoginLog } from '@/lib/login-log';

export async function GET(request: Request) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const user = await findUser(username);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === 'true';

  // Admins can request all login events; users only see their own
  const events = all && user.role === 'admin'
    ? await getAllLoginLog()
    : await getUserLoginLog(username);

  return NextResponse.json({
    events,
    lastLoginAt: user.lastLoginAt || null,
    user: username,
    role: user.role,
  });
}
