import { NextResponse } from 'next/server';
import path from 'path';
import { stat, readFile } from 'fs/promises';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllStls, STLS_DIR } from '@/lib/stls-db';

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

  const stls = await getAllStls();
  const stl = stls.find((s) => s.filename === filename);

  if (!stl) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const userRecord = await findUser(username);
  const isAdmin = userRecord?.role === 'admin';
  if (!isAdmin && !stl.assignedUsers.includes(username)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const filePath = path.join(STLS_DIR, filename);
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'model/stl',
        'Content-Length': fileStat.size.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
