import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { createStl, ensureStlsDir, STLS_DIR } from '@/lib/stls-db';

async function requireAdmin() {
  const username = await checkAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const user = await findUser(username);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return username;
}

export async function POST(request: Request) {
  const adminUser = await requireAdmin();
  if (typeof adminUser !== 'string') return adminUser;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim() || '';

    if (!file || !title) {
      return NextResponse.json({ error: 'Title and STL file required' }, { status: 400 });
    }

    const isStl =
      file.type === 'model/stl' ||
      file.type === 'application/octet-stream' ||
      file.name.toLowerCase().endsWith('.stl');

    if (!isStl) {
      return NextResponse.json({ error: 'Only STL files are allowed' }, { status: 400 });
    }

    await ensureStlsDir();

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(STLS_DIR, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const stl = await createStl(title, filename, adminUser, file.size);

    return NextResponse.json({ success: true, stl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
