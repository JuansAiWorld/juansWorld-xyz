import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { findUser } from '@/lib/users';
import { getAllContent, isContentVisible } from '@/lib/content-db';
import { getAllPdfReports } from '@/lib/reports-db';

export async function GET(request: Request) {
  const username = await checkAuth();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const lang = searchParams.get('lang') || 'en';

  const userRecord = username ? await findUser(username) : null;
  const isAdmin = userRecord?.role === 'admin';

  // Fetch markdown content
  let content = await getAllContent(lang);
  if (category) {
    content = content.filter((item) => item.category === category);
  }

  // Fetch PDFs and merge
  const pdfReports = await getAllPdfReports();
  const pdfItems = pdfReports.map((p) => ({
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
    category: 'report' as const,
    publishAt: p.publishAt,
    expireAt: p.expireAt,
    assignedUsers: p.assignedUsers,
  }));

  const merged = [...content, ...pdfItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter by visibility and permissions
  const now = new Date();
  const visible = merged.filter((item) => {
    // Public content (briefs) is visible to everyone
    if (item.category === 'brief' || (item as any).isPublic) {
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
