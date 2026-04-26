import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { validateApiKey } from '@/lib/api-keys';
import { ensureContentDir, getContentDir, saveContentToRedis } from '@/lib/content-db';

export async function PUT(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const valid = await validateApiKey(apiKey);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      slug,
      title,
      content,
      category = 'update',
      lang = 'en',
      publishAt,
      expireAt,
      assignedUsers,
      isPublic,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'slug, title, and content are required' },
        { status: 400 }
      );
    }

    if (!['report', 'brief', 'update'].includes(category)) {
      return NextResponse.json(
        { error: 'category must be report, brief, or update' },
        { status: 400 }
      );
    }

    const safeSlug = String(slug).replace(/[^a-zA-Z0-9_-]/g, '_');
    const today = new Date().toISOString().split('T')[0];

    // Build frontmatter
    const frontmatterLines: string[] = ['---'];
    frontmatterLines.push(`title: ${title}`);
    frontmatterLines.push(`date: ${today}`);
    if (publishAt) frontmatterLines.push(`publishAt: ${publishAt}`);
    if (expireAt) frontmatterLines.push(`expireAt: ${expireAt}`);
    if (assignedUsers && assignedUsers.length > 0) {
      frontmatterLines.push(`assignedUsers: [${assignedUsers.map((u: string) => `"${u}"`).join(', ')}]`);
    }
    if (isPublic !== undefined) frontmatterLines.push(`isPublic: ${isPublic}`);
    frontmatterLines.push('---');

    const fileContent = `${frontmatterLines.join('\n')}\n\n${content}\n`;

    // Primary: save to Redis (required for serverless / Vercel)
    const savedRedis = await saveContentToRedis(
      category as 'report' | 'brief' | 'update',
      safeSlug,
      fileContent,
      lang
    );

    // Fallback: write to filesystem for local dev
    if (!savedRedis) {
      const dir = getContentDir(category as 'report' | 'brief' | 'update', lang);
      await ensureContentDir(category as 'report' | 'brief' | 'update', lang);
      const filePath = path.join(dir, `${safeSlug}.md`);
      await writeFile(filePath, fileContent, 'utf-8');
      return NextResponse.json({ success: true, slug: safeSlug, category, lang, path: filePath });
    }

    return NextResponse.json({ success: true, slug: safeSlug, category, storage: 'redis' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
