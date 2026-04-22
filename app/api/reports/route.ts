import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllReports, getAllPdfReports, deletePdfReport } from '@/lib/reports-db';

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

  // Markdown reports (visible to all authenticated users)
  let reports = await getAllReports();

  // PDF reports (filtered by assignment unless admin)
  const pdfReports = await getAllPdfReports();
  const visiblePdfs = isAdmin
    ? pdfReports
    : pdfReports.filter((r) => r.assignedUsers.includes(username));

  // Merge PDFs into reports list with consistent shape
  const merged = [
    ...reports,
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
