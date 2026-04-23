import { NextResponse } from 'next/server';
import path from 'path';
import { stat, readFile } from 'fs/promises';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllPdfReports, PDFS_DIR } from '@/lib/reports-db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 });
  }

  // Find report by filename
  const reports = await getAllPdfReports();
  const report = reports.find((r) => r.filename === filename);

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Check access
  const userRecord = await findUser(username);
  const isAdmin = userRecord?.role === 'admin';
  if (!isAdmin && !report.assignedUsers.includes(username)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Serve file from buffer (more reliable than streams in serverless)
  const filePath = path.join(PDFS_DIR, filename);
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileStat.size.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
