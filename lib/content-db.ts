import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  redis = null;
}

const CONTENT_DIRS: Record<string, Record<string, string>> = {
  report: { en: path.join(process.cwd(), 'reports') },
  brief: {
    en: path.join(process.cwd(), 'content', 'briefs'),
    ja: path.join(process.cwd(), 'content', 'briefs-jp'),
    es: path.join(process.cwd(), 'content', 'briefs-mx'),
  },
  update: {
    en: path.join(process.cwd(), 'content', 'updates'),
    ja: path.join(process.cwd(), 'content', 'updates-jp'),
    es: path.join(process.cwd(), 'content', 'updates-mx'),
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

function dateLocale(lang: string): string {
  if (lang === 'ja') return 'ja-JP';
  if (lang === 'es') return 'es-MX';
  return 'en-US';
}

async function parseMarkdownItem(
  slug: string,
  raw: string,
  category: 'report' | 'brief' | 'update',
  filePath?: string,
  lang: string = 'en'
): Promise<ContentItem> {
  const parsed = matter(raw);
  const html = await marked(parsed.content);
  const locale = dateLocale(lang);

  const title =
    parsed.data.title ||
    (parsed.content.split('\n')[0].trim().startsWith('#')
      ? parsed.content.split('\n')[0].trim().replace(/^#+\s*/, '')
      : slug);

  const date = parsed.data.date
    ? new Date(parsed.data.date).toISOString()
    : new Date().toISOString();

  return {
    slug,
    title,
    date,
    date_formatted: new Date(parsed.data.date || Date.now()).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    path: filePath || `${category}/${slug}.md`,
    type: 'markdown',
    category,
    publishAt: parsed.data.publishAt,
    expireAt: parsed.data.expireAt,
    assignedUsers: parsed.data.assignedUsers,
    isPublic: parsed.data.isPublic ?? category === 'brief',
    content: parsed.content,
    html,
  };
}

/* ─── Redis content storage ─── */

function redisKey(category: string, lang: string = 'en'): string {
  return `content:${category}:${lang}`;
}

async function scanRedisCategory(
  category: 'report' | 'brief' | 'update',
  lang: string = 'en'
): Promise<ContentItem[]> {
  if (!redis) return [];
  try {
    const data = await redis.hgetall<Record<string, string>>(redisKey(category, lang));
    if (!data || Object.keys(data).length === 0) return [];

    const items: ContentItem[] = [];
    for (const [slug, rawMarkdown] of Object.entries(data)) {
      if (!rawMarkdown) continue;
      items.push(await parseMarkdownItem(slug, rawMarkdown, category, undefined, lang));
    }
    return items;
  } catch {
    return [];
  }
}

export async function saveContentToRedis(
  category: 'report' | 'brief' | 'update',
  slug: string,
  rawMarkdown: string,
  lang: string = 'en'
): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.hset(redisKey(category, lang), { [slug]: rawMarkdown });
    return true;
  } catch {
    return false;
  }
}

export async function getRawContentFromRedis(
  category: 'report' | 'brief' | 'update',
  slug: string,
  lang: string = 'en'
): Promise<string | null> {
  if (!redis) return null;
  try {
    const raw = await redis.hget<string>(redisKey(category, lang), slug);
    return raw || null;
  } catch {
    return null;
  }
}

export async function deleteContentFromRedis(
  category: 'report' | 'brief' | 'update',
  slug: string,
  lang: string = 'en'
): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.hdel(redisKey(category, lang), slug);
    return true;
  } catch {
    return false;
  }
}

/* ─── Filesystem content storage ─── */

async function scanFilesystemCategory(
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
    const slug = path.basename(file, '.md');

    const item = await parseMarkdownItem(slug, raw, category, path.relative(process.cwd(), file), lang);
    // Use file mtime as fallback date if frontmatter has no date
    if (!matter(raw).data.date) {
      item.date = created.toISOString();
      item.date_formatted = created.toLocaleDateString(dateLocale(lang), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    items.push(item);
  }

  return items;
}

/* ─── Unified scan ─── */

async function scanCategory(
  category: 'report' | 'brief' | 'update',
  lang: string = 'en'
): Promise<ContentItem[]> {
  const [redisItems, fileItems] = await Promise.all([
    scanRedisCategory(category, lang),
    scanFilesystemCategory(category, lang),
  ]);

  const redisSlugs = new Set(redisItems.map((i) => i.slug));
  const uniqueFileItems = fileItems.filter((i) => !redisSlugs.has(i.slug));

  return [...redisItems, ...uniqueFileItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
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
  return all.find((item) => item.slug === slug && (!category || item.category === category)) || null;
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
