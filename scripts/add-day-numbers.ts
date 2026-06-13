import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DIARY_DIR = path.join(process.cwd(), 'content', 'diary');

function extractRawDate(raw: string): string {
  // Extract the raw date string as it appears in frontmatter
  const m = raw.match(/^date:\s*(.+)$/m);
  if (!m) return '';
  return m[1].trim();
}

async function main() {
  const files = (await fs.readdir(DIARY_DIR))
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(DIARY_DIR, f));

  // Sort by raw date string ascending
  const entries: { file: string; rawDate: string; slug: string }[] = [];
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const rawDate = extractRawDate(raw) || path.basename(file).slice(0, 10);
    entries.push({ file, rawDate, slug: path.basename(file, '.md') });
  }
  entries.sort((a, b) => a.rawDate.localeCompare(b.rawDate));

  for (let i = 0; i < entries.length; i++) {
    const { file, rawDate } = entries[i];
    const dayNumber = i + 1;
    const raw = await fs.readFile(file, 'utf-8');

    // Add or update day_number in frontmatter using string replacement
    let newRaw: string;
    if (/^day_number:/m.test(raw)) {
      newRaw = raw.replace(/^(day_number:\s*)\S+/m, `$1${dayNumber}`);
    } else {
      newRaw = raw.replace(/^(date:\s*.+)$/m, `$1\nday_number: ${dayNumber}`);
    }

    await fs.writeFile(file, newRaw, 'utf-8');
    console.log(`Updated ${path.basename(file)} → Day ${dayNumber} (${rawDate})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
