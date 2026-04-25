import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllReports, getAllPdfReports, deletePdfReport, isContentVisible } from '@/lib/reports-db';

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

  // Markdown reports (filter by schedule and assignment unless admin)
  let reports = await getAllReports();
  if (!isAdmin) {
    reports = reports.filter((r) => {
      if (!isContentVisible(r)) return false;
      if (r.assignedUsers && r.assignedUsers.length > 0 && !r.assignedUsers.includes(username)) return false;
      return true;
    });
  }

  // PDF reports (filtered by assignment and schedule unless admin)
  const pdfReports = await getAllPdfReports();
  const visiblePdfs = isAdmin
    ? pdfReports
    : pdfReports.filter((r) => {
        if (!isContentVisible(r)) return false;
        return r.assignedUsers.includes(username);
      });

  // Merge PDFs into reports list with consistent shape
  const now = new Date();
  const merged = [
    ...reports.map((r) => ({
      ...r,
      status: isAdmin ? (isContentVisible(r) ? 'live' : 'scheduled') : undefined,
    })),
    ...visiblePdfs.map((p) => ({
      slug: p.id,
      title: p.title,
      date: p.uploadedAt,
      date_formatted: new Date(p.uploadedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      path: p.filename,
      type: 'pdf' as const,
      assignedUsers: isAdmin ? p.assignedUsers : undefined,
      publishAt: p.publishAt,
      expireAt: p.expireAt,
      status: isAdmin ? (isContentVisible(p) ? 'live' : 'scheduled') : undefined,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
  }

  try {
    await deletePdfReport(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete report' }, { status: 400 });
  }
}
