import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllContent, getContentBySlug, isContentVisible } from '@/lib/content-db';


export async function GET(request: Request) {
  const username = await checkAuth();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const lang = searchParams.get('lang') || 'en';
  const slug = searchParams.get('slug');

  const userRecord = username ? await findUser(username) : null;
  const isAdmin = userRecord?.role === 'admin';

  // Single item lookup
  if (slug) {
    const item = await getContentBySlug(slug, category || undefined);
    if (!item) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    const now = new Date();
    const canSee = item.category === 'brief' || item.isPublic || isAdmin || (username && isContentVisible(item, now));
    if (!canSee) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    return NextResponse.json({ item, user: username, role: userRecord?.role || 'guest' });
  }

  // Fetch markdown content
  let content = await getAllContent(lang);
  if (category) {
    content = content.filter((item) => item.category === category);
  }

  const merged = [...content].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter by visibility and permissions
  const now = new Date();
  const visible = merged.filter((item) => {
    // Public content (briefs, fieldnotes, tasks) is visible to everyone
    if (item.category === 'brief' || item.category === 'fieldnote' || item.category === 'task' || (item as any).isPublic) {
      return isContentVisible(item, now);
    }

    // Auth required for non-public content
    if (!username) return false;

    // Admins see everything
    if (isAdmin) return true;

    // Check schedule
    if (!isContentVisible(item, now)) return false;

    // Check assignments
    if (item.assignedUsers && item.assignedUsers.length > 0) {
      return item.assignedUsers.includes(username);
    }

    return true;
  });

  const perPage = 20;
  const total = visible.length;
  const start = (page - 1) * perPage;
  const paginated = visible.slice(start, start + perPage);

  return NextResponse.json({
    items: paginated,
    page,
    total_pages: Math.ceil(total / perPage) || 1,
    total,
    user: username,
    role: userRecord?.role || 'guest',
  });
}
