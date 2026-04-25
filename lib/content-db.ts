import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';

const CONTENT_DIRS: Record<string, Record<string, string>> = {
  report: { en: path.join(process.cwd(), 'reports') },
  brief: {
    en: path.join(process.cwd(), 'content', 'briefs'),
    ja: path.join(process.cwd(), 'content', 'briefs-jp'),
  },
  update: {
    en: path.join(process.cwd(), 'content', 'updates'),
    ja: path.join(process.cwd(), 'content', 'updates-jp'),
  },
};

export interface ContentItem {
  slug: string;
  title: string;
  date: string;
  date_formatted: string;
  path: string;
  type: 'markdown';
  category: 'report' | 'brief' | 'update';
  publishAt?: string;
  expireAt?: string;
  assignedUsers?: string[];
  isPublic?: boolean;
  content?: string;
  html?: string;
}

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await getMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return files;
}

async function scanCategory(
  category: 'report' | 'brief' | 'update',
  lang: string = 'en'
): Promise<ContentItem[]> {
  const dir = CONTENT_DIRS[category][lang] || CONTENT_DIRS[category]['en'];
  const files = await getMarkdownFiles(dir);
  const items: ContentItem[] = [];

  for (const file of files) {
    const stat = await fs.stat(file);
    const created = new Date(stat.mtime);
    const raw = await fs.readFile(file, 'utf-8');
    const parsed = matter(raw);

    const title =
      parsed.data.title ||
      (parsed.content.split('\n')[0].trim().startsWith('#')
        ? parsed.content.split('\n')[0].trim().replace(/^#+\s*/, '')
        : path.basename(file, '.md'));

    const slug = path.basename(file, '.md');

    const html = await marked(parsed.content);
    items.push({
      slug,
      title,
      date: parsed.data.date ? new Date(parsed.data.date).toISOString() : created.toISOString(),
      date_formatted: new Date(parsed.data.date || created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      path: path.relative(process.cwd(), file),
      type: 'markdown',
      category,
      publishAt: parsed.data.publishAt,
      expireAt: parsed.data.expireAt,
      assignedUsers: parsed.data.assignedUsers,
      isPublic: parsed.data.isPublic ?? category === 'brief',
      content: parsed.content,
      html,
    });
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllContent(lang?: string): Promise<ContentItem[]> {
  const [reports, briefs, updates] = await Promise.all([
    scanCategory('report', 'en'),
    scanCategory('brief', lang || 'en'),
    scanCategory('update', lang || 'en'),
  ]);
  return [...briefs, ...updates, ...reports].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getContentBySlug(
  slug: string,
  category?: string
): Promise<ContentItem | null> {
  const all = await getAllContent();
  const found = all.find((item) => item.slug === slug && (!category || item.category === category));
  if (!found) return null;

  const dir = CONTENT_DIRS[found.category]['en'];
  const filePath = path.join(dir, `${slug}.md`);
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = matter(raw);
  const html = await marked(parsed.content);

  return {
    ...found,
    content: parsed.content,
    html,
  };
}

export async function getContentByCategory(
  category: 'report' | 'brief' | 'update',
  lang?: string
): Promise<ContentItem[]> {
  return scanCategory(category, lang);
}

export function isContentVisible(
  item: { publishAt?: string | null; expireAt?: string | null },
  now = new Date()
): boolean {
  const publishDate = item.publishAt ? new Date(item.publishAt) : null;
  const expireDate = item.expireAt ? new Date(item.expireAt) : null;
  if (publishDate && publishDate > now) return false;
  if (expireDate && expireDate <= now) return false;
  return true;
}

export async function ensureContentDir(category: 'report' | 'brief' | 'update', lang: string = 'en'): Promise<void> {
  try {
    const dir = CONTENT_DIRS[category][lang] || CONTENT_DIRS[category]['en'];
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Ignore
  }
}

export function getContentDir(category: 'report' | 'brief' | 'update', lang: string = 'en'): string {
  return CONTENT_DIRS[category][lang] || CONTENT_DIRS[category]['en'];
}
