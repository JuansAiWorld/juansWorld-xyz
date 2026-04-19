import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';

const REPORTS_DIR = path.join(process.cwd(), 'reports');

export interface Report {
  slug: string;
  title: string;
  date: string;
  date_formatted: string;
  path: string;
}

export interface ReportDetail extends Report {
  content: string;
  html: string;
}

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
      };
    }
  }

  return null;
}
