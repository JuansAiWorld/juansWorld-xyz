import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { updatePdfReportSchedule } from '@/lib/reports-db';

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
    const { id, publishAt, expireAt } = data;

    if (!id) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    await updatePdfReportSchedule(id, publishAt, expireAt);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update schedule' }, { status: 400 });
  }
}
