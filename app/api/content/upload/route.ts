import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { validateApiKey } from '@/lib/api-keys';
import {
  ensureContentDir,
  getContentDir,
  saveContentToRedis,
  getRawContentFromRedis,
  deleteContentFromRedis,
} from '@/lib/content-db';

function yamlValue(value: string): string {
  if (/[:#{}[\],&*!?|>'"@%-]/.test(value) || value.trim() !== value) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

/* ─── CREATE ─── */
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
    const cleanContent = matter(content).content.trim();

    const frontmatterLines: string[] = ['---'];
    frontmatterLines.push(`title: ${yamlValue(title)}`);
    frontmatterLines.push(`date: ${today}`);
    if (publishAt) frontmatterLines.push(`publishAt: ${publishAt}`);
    if (expireAt) frontmatterLines.push(`expireAt: ${expireAt}`);
    if (assignedUsers && assignedUsers.length > 0) {
      frontmatterLines.push(`assignedUsers: [${assignedUsers.map((u: string) => `"${u}"`).join(', ')}]`);
    }
    if (isPublic !== undefined) frontmatterLines.push(`isPublic: ${isPublic}`);
    frontmatterLines.push('---');

    const fileContent = `${frontmatterLines.join('\n')}\n\n${cleanContent}\n`;

    const savedRedis = await saveContentToRedis(
      category as 'report' | 'brief' | 'update',
      safeSlug,
      fileContent,
      lang
    );

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

/* ─── UPDATE ─── */
export async function PATCH(request: Request) {
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

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const safeSlug = String(slug).replace(/[^a-zA-Z0-9_-]/g, '_');

    // Read existing content
    const raw = await getRawContentFromRedis(
      category as 'report' | 'brief' | 'update',
      safeSlug,
      lang
    );
    if (!raw) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const parsed = matter(raw);

    // Merge updates
    const newTitle = title !== undefined ? title : parsed.data.title;
    const newContent = content !== undefined ? matter(content).content.trim() : parsed.content;
    const newDate = parsed.data.date || new Date().toISOString().split('T')[0];
    const newPublishAt = publishAt !== undefined ? publishAt : parsed.data.publishAt;
    const newExpireAt = expireAt !== undefined ? expireAt : parsed.data.expireAt;
    const newAssignedUsers = assignedUsers !== undefined ? assignedUsers : parsed.data.assignedUsers;
    const newIsPublic = isPublic !== undefined ? isPublic : parsed.data.isPublic;

    // Rebuild
    const frontmatterLines: string[] = ['---'];
    if (newTitle) frontmatterLines.push(`title: ${yamlValue(newTitle)}`);
    frontmatterLines.push(`date: ${newDate}`);
    if (newPublishAt) frontmatterLines.push(`publishAt: ${newPublishAt}`);
    if (newExpireAt) frontmatterLines.push(`expireAt: ${newExpireAt}`);
    if (newAssignedUsers && newAssignedUsers.length > 0) {
      frontmatterLines.push(`assignedUsers: [${newAssignedUsers.map((u: string) => `"${u}"`).join(', ')}]`);
    }
    if (newIsPublic !== undefined) frontmatterLines.push(`isPublic: ${newIsPublic}`);
    frontmatterLines.push('---');

    const fileContent = `${frontmatterLines.join('\n')}\n\n${newContent}\n`;

    const savedRedis = await saveContentToRedis(
      category as 'report' | 'brief' | 'update',
      safeSlug,
      fileContent,
      lang
    );

    if (!savedRedis) {
      const dir = getContentDir(category as 'report' | 'brief' | 'update', lang);
      await ensureContentDir(category as 'report' | 'brief' | 'update', lang);
      const filePath = path.join(dir, `${safeSlug}.md`);
      await writeFile(filePath, fileContent, 'utf-8');
      return NextResponse.json({ success: true, slug: safeSlug, category, lang, action: 'updated', path: filePath });
    }

    return NextResponse.json({ success: true, slug: safeSlug, category, lang, action: 'updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}

/* ─── DELETE ─── */
export async function DELETE(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const valid = await validateApiKey(apiKey);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category') || 'update';
    const lang = searchParams.get('lang') || 'en';

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const safeSlug = String(slug).replace(/[^a-zA-Z0-9_-]/g, '_');

    // Delete from Redis
    await deleteContentFromRedis(
      category as 'report' | 'brief' | 'update',
      safeSlug,
      lang
    );

    // Delete from filesystem if present
    try {
      const dir = getContentDir(category as 'report' | 'brief' | 'update', lang);
      const filePath = path.join(dir, `${safeSlug}.md`);
      await unlink(filePath);
    } catch {
      // File may not exist on disk — ignore
    }

    return NextResponse.json({ success: true, slug: safeSlug, category, lang, action: 'deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
