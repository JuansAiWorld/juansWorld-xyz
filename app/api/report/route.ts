import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getReportBySlug, getPdfReportById, getAllPdfReports } from '@/lib/reports-db';

export async function GET(request: Request) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('id');

  if (!slug) {
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
  }

  // Try markdown first
  const report = await getReportBySlug(slug);
  if (report) {
    return NextResponse.json({ report, user: username });
  }

  // Try PDF
  const pdfReport = await getPdfReportById(slug);
  if (pdfReport) {
    const userRecord = await findUser(username);
    const isAdmin = userRecord?.role === 'admin';

    // Check access
    if (!isAdmin && !pdfReport.assignedUsers.includes(username)) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      report: {
        slug: pdfReport.id,
        title: pdfReport.title,
        date: pdfReport.uploadedAt,
        date_formatted: new Date(pdfReport.uploadedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        path: pdfReport.filename,
        type: 'pdf',
        html: '',
        pdfUrl: `/api/pdfs/${pdfReport.filename}`,
        assignedUsers: isAdmin ? pdfReport.assignedUsers : undefined,
      },
      user: username,
    });
  }

  return NextResponse.json({ error: 'Report not found' }, { status: 404 });
}
