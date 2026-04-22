import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';
import { Redis } from '@upstash/redis';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
export const PDFS_DIR = process.env.VERCEL
  ? '/tmp/pdfs'
  : path.join(process.cwd(), 'public', 'pdfs');

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  redis = null;
}

const REPORTS_META_FILE = process.env.VERCEL
  ? '/tmp/reports-meta.json'
  : path.join(process.cwd(), 'data', 'reports-meta.json');

let memoryReports: PdfReport[] | null = null;

/* ─── Types ─── */

export interface Report {
  slug: string;
  title: string;
  date: string;
  date_formatted: string;
  path: string;
  type: 'markdown';
}

export interface ReportDetail extends Report {
  content: string;
  html: string;
}

export interface PdfReport {
  id: string;
  title: string;
  filename: string;
  assignedUsers: string[];
  uploadedAt: string;
  uploadedBy: string;
  type: 'pdf';
}

/* ─── Markdown reports (existing) ─── */

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getMarkdownFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function getAllReports(): Promise<Report[]> {
  const reports: Report[] = [];

  try {
    await fs.access(REPORTS_DIR);
  } catch {
    return reports;
  }

  const files = await getMarkdownFiles(REPORTS_DIR);

  for (const file of files) {
    const relPath = path.relative(REPORTS_DIR, file);
    const stat = await fs.stat(file);
    const created = new Date(stat.mtime);

    const content = await fs.readFile(file, 'utf-8');
    const firstLine = content.split('\n')[0].trim();
    const title = firstLine.startsWith('#')
      ? firstLine.replace(/^#+\s*/, '')
      : path.basename(file, '.md');
    const slug = path.basename(file, '.md');

    reports.push({
      slug,
      title,
      date: created.toISOString(),
      date_formatted: created.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      path: relPath,
      type: 'markdown',
    });
  }

  return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getReportBySlug(slug: string): Promise<ReportDetail | null> {
  try {
    await fs.access(REPORTS_DIR);
  } catch {
    return null;
  }

  const files = await getMarkdownFiles(REPORTS_DIR);

  for (const file of files) {
    if (path.basename(file, '.md') === slug) {
      const content = await fs.readFile(file, 'utf-8');
      const html = await marked(content);
      const relPath = path.relative(REPORTS_DIR, file);
      const stat = await fs.stat(file);
      const created = new Date(stat.mtime);

      return {
        slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        date: created.toISOString(),
        date_formatted: created.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        path: relPath,
        content,
        html,
        type: 'markdown',
      };
    }
  }

  return null;
}

/* ─── PDF reports (new) ─── */

async function getPdfReportsFromRedis(): Promise<PdfReport[] | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<PdfReport[]>('pdf-reports');
    return data || [];
  } catch {
    return null;
  }
}

async function savePdfReportsToRedis(reports: PdfReport[]): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('pdf-reports', reports);
    return true;
  } catch {
    return false;
  }
}

async function getPdfReportsFromFile(): Promise<PdfReport[] | null> {
  try {
    const data = await fs.readFile(REPORTS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function savePdfReportsToFile(reports: PdfReport[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(REPORTS_META_FILE), { recursive: true });
    await fs.writeFile(REPORTS_META_FILE, JSON.stringify(reports, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function getAllPdfReports(): Promise<PdfReport[]> {
  const redisReports = await getPdfReportsFromRedis();
  if (redisReports !== null) {
    memoryReports = redisReports;
    return redisReports;
  }

  const fileReports = await getPdfReportsFromFile();
  if (fileReports !== null) {
    memoryReports = fileReports;
    await savePdfReportsToRedis(fileReports);
    return fileReports;
  }

  if (memoryReports) {
    return memoryReports;
  }

  return [];
}

export async function savePdfReports(reports: PdfReport[]): Promise<void> {
  memoryReports = reports;
  const savedRedis = await savePdfReportsToRedis(reports);
  if (savedRedis) return;
  await savePdfReportsToFile(reports);
}

export async function getPdfReportById(id: string): Promise<PdfReport | null> {
  const reports = await getAllPdfReports();
  return reports.find((r) => r.id === id) || null;
}

export async function createPdfReport(
  title: string,
  filename: string,
  uploadedBy: string
): Promise<PdfReport> {
  const reports = await getAllPdfReports();
  const report: PdfReport = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    filename,
    assignedUsers: [],
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    type: 'pdf',
  };
  reports.push(report);
  await savePdfReports(reports);
  return report;
}

export async function assignUsersToPdfReport(id: string, usernames: string[]): Promise<void> {
  const reports = await getAllPdfReports();
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Report not found');
  reports[idx].assignedUsers = usernames;
  await savePdfReports(reports);
}

export async function deletePdfReport(id: string): Promise<void> {
  const reports = await getAllPdfReports();
  const idx = reports.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Report not found');
  const report = reports[idx];

  // Delete file from disk
  try {
    const filePath = path.join(PDFS_DIR, report.filename);
    await fs.unlink(filePath);
  } catch {
    // Ignore file deletion errors
  }

  reports.splice(idx, 1);
  await savePdfReports(reports);
}

export async function ensurePdfsDir(): Promise<void> {
  try {
    await fs.mkdir(PDFS_DIR, { recursive: true });
  } catch {
    // Ignore
  }
}
