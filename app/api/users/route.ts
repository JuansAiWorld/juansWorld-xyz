import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { getUsers, findUser, createUser, updateUser, deleteUser } from '@/lib/users';

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

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const users = await getUsers();
  const safeUsers = users.map((u) => ({ username: u.username, role: u.role }));
  return NextResponse.json({ users: safeUsers });
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const data = await request.json();
    const { action } = data;

    if (action === 'create') {
      const { username, password, role = 'user' } = data;
      if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
      }
      const user = await createUser(username, password, role);
      return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
    }

    if (action === 'update') {
      const { username, newUsername, password, role } = data;
      if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
      }
      await updateUser(username, newUsername, password, role);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { username } = data;
      if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
      }
      await deleteUser(username);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 400 });
  }
}
