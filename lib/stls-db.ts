import { promises as fs } from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  redis = null;
}

export const STLS_DIR = process.env.VERCEL
  ? '/tmp/stls'
  : path.join(process.cwd(), 'public', 'stls');

const STLS_META_FILE = process.env.VERCEL
  ? '/tmp/stls-meta.json'
  : path.join(process.cwd(), 'data', 'stls-meta.json');

let memoryStls: StlFile[] | null = null;

/* ─── Types ─── */

export interface StlFile {
  id: string;
  title: string;
  filename: string;
  assignedUsers: string[];
  uploadedAt: string;
  uploadedBy: string;
  fileSize?: number;
}

/* ─── Storage helpers ─── */

async function getStlsFromRedis(): Promise<StlFile[] | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<StlFile[]>('stl-files');
    return data || [];
  } catch {
    return null;
  }
}

async function saveStlsToRedis(stls: StlFile[]): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('stl-files', stls);
    return true;
  } catch {
    return false;
  }
}

async function getStlsFromFile(): Promise<StlFile[] | null> {
  try {
    const data = await fs.readFile(STLS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveStlsToFile(stls: StlFile[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(STLS_META_FILE), { recursive: true });
    await fs.writeFile(STLS_META_FILE, JSON.stringify(stls, null, 2));
    return true;
  } catch {
    return false;
  }
}

/* ─── Public API ─── */

export async function getAllStls(): Promise<StlFile[]> {
  const redisStls = await getStlsFromRedis();
  if (redisStls !== null) {
    memoryStls = redisStls;
    return redisStls;
  }

  const fileStls = await getStlsFromFile();
  if (fileStls !== null) {
    memoryStls = fileStls;
    await saveStlsToRedis(fileStls);
    return fileStls;
  }

  if (memoryStls) {
    return memoryStls;
  }

  return [];
}

export async function saveStls(stls: StlFile[]): Promise<void> {
  memoryStls = stls;
  const savedRedis = await saveStlsToRedis(stls);
  if (savedRedis) return;
  await saveStlsToFile(stls);
}

export async function getStlById(id: string): Promise<StlFile | null> {
  const stls = await getAllStls();
  return stls.find((s) => s.id === id) || null;
}

export async function createStl(
  title: string,
  filename: string,
  uploadedBy: string,
  fileSize?: number
): Promise<StlFile> {
  const stls = await getAllStls();
  const stl: StlFile = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    filename,
    assignedUsers: [],
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    fileSize,
  };
  stls.push(stl);
  await saveStls(stls);
  return stl;
}

export async function assignUsersToStl(id: string, usernames: string[]): Promise<void> {
  const stls = await getAllStls();
  const idx = stls.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('STL file not found');
  stls[idx].assignedUsers = usernames;
  await saveStls(stls);
}

export async function deleteStl(id: string): Promise<void> {
  const stls = await getAllStls();
  const idx = stls.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('STL file not found');
  const stl = stls[idx];

  try {
    const filePath = path.join(STLS_DIR, stl.filename);
    await fs.unlink(filePath);
  } catch {
    // Ignore file deletion errors
  }

  stls.splice(idx, 1);
  await saveStls(stls);
}

export async function ensureStlsDir(): Promise<void> {
  try {
    await fs.mkdir(STLS_DIR, { recursive: true });
  } catch {
    // Ignore
  }
}
