import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { assignUsersToStl } from '@/lib/stls-db';

async function requireAdmin() {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const user = await findUser(username);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return null;
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const data = await request.json();
    const { id, usernames } = data;

    if (!id || !Array.isArray(usernames)) {
      return NextResponse.json({ error: 'STL ID and usernames array required' }, { status: 400 });
    }

    await assignUsersToStl(id, usernames);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to assign users' }, { status: 400 });
  }
}
