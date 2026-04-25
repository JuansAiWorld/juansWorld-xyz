import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllApiKeys, createApiKey, deleteApiKey } from '@/lib/api-keys';

async function requireAdmin(request: Request) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const user = await findUser(username);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return username;
}

export async function GET(request: Request) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const keys = await getAllApiKeys();
    return NextResponse.json({ keys });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const data = await request.json();
    const { name, action, key } = data;

    if (action === 'delete' && key) {
      await deleteApiKey(key);
      return NextResponse.json({ success: true });
    }

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const newKey = await createApiKey(name, adminUser);
    return NextResponse.json({ success: true, key: newKey });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
