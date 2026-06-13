import { promises as fs } from 'fs';
import path from 'path';

const VAULT_DIR = '/home/theone/Projects/05252026Vault/To Infinity/Diary Entries';
const OUT_DIR = path.join(process.cwd(), 'content', 'diary');

interface ParsedEntry {
  date: string;
  slug: string;
  title: string;
  body: string;
}

function kebabCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractDateFromFilename(filename: string): string | null {
  // Match YYYY-MM-DD anywhere in the filename
  const m = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function extractTitle(body: string, filename: string): string {
  // Prefer the first ## or # heading
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.replace(/^#\s+/, '').trim();
    }
    if (trimmed.startsWith('## ')) {
      return trimmed.replace(/^##\s+/, '').trim();
    }
  }
  // Fallback to filename stem
  return path.basename(filename, '.md').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripSystemReminders(body: string): string {
  // Remove blocks that start with <SYSTEM-REMINDER> and end with </SYSTEM-REMINDER>
  return body
    .replace(/<SYSTEM-REMINDER>[\s\S]*?<\/SYSTEM-REMINDER>/gi, '')
    .replace(/^\s*---\s*\n/, '') // stray leading frontmatter dashes
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeBody(body: string): string {
  // Remove any existing YAML frontmatter only if the closing --- is near the top.
  // Some source files start with a stray --- used as a horizontal rule; we avoid
  // stripping all the way down to the system-reminder closing --- at the bottom.
  if (body.startsWith('---')) {
    const end = body.indexOf('---', 3);
    const linesBeforeEnd = end !== -1 ? body.slice(0, end).split('\n').length : Infinity;
    if (end !== -1 && linesBeforeEnd <= 20) {
      body = body.slice(end + 3).trim();
    }
  }
  body = stripSystemReminders(body);
  return body;
}

async function parseFile(filePath: string): Promise<ParsedEntry | null> {
  const filename = path.basename(filePath);
  const date = extractDateFromFilename(filename);
  if (!date) {
    console.warn(`Skipping ${filename}: no date found`);
    return null;
  }

  const raw = await fs.readFile(filePath, 'utf-8');
  const body = normalizeBody(raw);
  const title = extractTitle(body, filename);
  const slugBase = path.basename(filename, '.md');
  const slug = `${date}-${slugBase.replace(/^day\d+-\d{4}-\d{2}-\d{2}-/, '')}`;

  return { date, slug, title, body };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await fs.readdir(VAULT_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('Diary Entries Index'));

  const entries: ParsedEntry[] = [];
  for (const f of mdFiles) {
    const entry = await parseFile(path.join(VAULT_DIR, f));
    if (entry) entries.push(entry);
  }

  // Sort by date ascending so the file list is clean
  entries.sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of entries) {
    const frontmatter = [
      '---',
      `title: "${entry.title.replace(/"/g, '\\"')}"`,
      `date: ${entry.date}`,
      'author: "Juan"',
      'category: diary',
      'status: published',
      'source: "vault/claw-bot"',
      '---',
      '',
      entry.body,
      '',
    ].join('\n');

    const outPath = path.join(OUT_DIR, `${entry.slug}.md`);
    await fs.writeFile(outPath, frontmatter, 'utf-8');
    console.log(`Wrote ${outPath}`);
  }

  console.log(`\nMigrated ${entries.length} diary entries to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
