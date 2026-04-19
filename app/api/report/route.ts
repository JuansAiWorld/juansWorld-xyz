import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { getReportBySlug } from '@/lib/reports-db';

export async function GET(request: Request) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('id');

  if (!slug) {
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
  }

  const report = await getReportBySlug(slug);
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({ report, user });
}
