import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllReports, isContentVisible } from '@/lib/reports-db';

export async function GET(request: Request) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const opponent = searchParams.get('opponent') || '';

  const userRecord = await findUser(username);
  const isAdmin = userRecord?.role === 'admin';

  let reports = await getAllReports();
  if (!isAdmin) {
    reports = reports.filter((r) => {
      if (!isContentVisible(r)) return false;
      if (r.assignedUsers && r.assignedUsers.length > 0 && !r.assignedUsers.includes(username)) return false;
      return true;
    });
  }

  const merged = reports.map((r) => ({
    ...r,
    status: isAdmin ? (isContentVisible(r) ? 'live' : 'scheduled') : undefined,
  }));

  let filtered = merged;
  if (opponent) {
    filtered = merged.filter((r) => r.title.toLowerCase().includes(opponent.toLowerCase()));
  }

  const perPage = 10;
  const total = filtered.length;
  const start = (page - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  return NextResponse.json({
    reports: paginated,
    page,
    total_pages: Math.ceil(total / perPage) || 1,
    total,
    user: username,
    role: userRecord?.role || 'user',
  });
}
