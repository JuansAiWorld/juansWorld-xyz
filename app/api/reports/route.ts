import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { getAllReports } from '@/lib/reports-db';

export async function GET(request: Request) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const opponent = searchParams.get('opponent') || '';

  let reports = await getAllReports();

  if (opponent) {
    reports = reports.filter((r) => r.title.toLowerCase().includes(opponent.toLowerCase()));
  }

  const perPage = 10;
  const total = reports.length;
  const start = (page - 1) * perPage;
  const paginated = reports.slice(start, start + perPage);

  return NextResponse.json({
    reports: paginated,
    page,
    total_pages: Math.ceil(total / perPage) || 1,
    total,
    user,
  });
}
