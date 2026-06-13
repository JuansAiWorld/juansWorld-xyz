import { promises as fs } from 'fs';
import path from 'path';

const DIARY_DIR = path.join(process.cwd(), 'content', 'diary');

async function main() {
  const files = (await fs.readdir(DIARY_DIR))
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(DIARY_DIR, f));

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const filenameDate = path.basename(file).slice(0, 10);
    const newRaw = raw.replace(/^(date:\s*)\S+/m, `$1${filenameDate}`);
    if (newRaw !== raw) {
      await fs.writeFile(file, newRaw, 'utf-8');
      console.log(`Restored date ${filenameDate} in ${path.basename(file)}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
