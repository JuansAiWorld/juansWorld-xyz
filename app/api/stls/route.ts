import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllStls, deleteStl } from '@/lib/stls-db';

export async function GET(request: Request) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);

  const userRecord = await findUser(username);
  const isAdmin = userRecord?.role === 'admin';

  let stls = await getAllStls();

  // Filter by assignment unless admin
  if (!isAdmin) {
    stls = stls.filter((s) => s.assignedUsers.includes(username));
  }

  const perPage = 10;
  const total = stls.length;
  const start = (page - 1) * perPage;
  const paginated = stls.slice(start, start + perPage);

  return NextResponse.json({
    stls: paginated,
    page,
    total_pages: Math.ceil(total / perPage) || 1,
    total,
    user: username,
    role: userRecord?.role || 'user',
  });
}

export async function DELETE(request: Request) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const userRecord = await findUser(username);
  if (userRecord?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'STL ID required' }, { status: 400 });
  }

  try {
    await deleteStl(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete STL' }, { status: 400 });
  }
}
