import { randomBytes } from 'crypto';
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

const KEYS_FILE = process.env.VERCEL
  ? '/tmp/api-keys.json'
  : path.join(process.cwd(), 'data', 'api-keys.json');

export interface ApiKey {
  key: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

async function getKeysFromRedis(): Promise<ApiKey[] | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<ApiKey[]>('api-keys');
    return data || [];
  } catch {
    return null;
  }
}

async function saveKeysToRedis(keys: ApiKey[]): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('api-keys', keys);
    return true;
  } catch {
    return false;
  }
}

async function getKeysFromFile(): Promise<ApiKey[] | null> {
  try {
    const data = await fs.readFile(KEYS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveKeysToFile(keys: ApiKey[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(KEYS_FILE), { recursive: true });
    await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2));
    return true;
  } catch {
    return false;
  }
}

let memoryKeys: ApiKey[] | null = null;

export async function getAllApiKeys(): Promise<ApiKey[]> {
  // 1. Try Redis
  const redisKeys = await getKeysFromRedis();
  if (redisKeys !== null && redisKeys.length > 0) {
    memoryKeys = redisKeys;
    return redisKeys;
  }

  // 2. Try file
  const fileKeys = await getKeysFromFile();
  if (fileKeys !== null && fileKeys.length > 0) {
    memoryKeys = fileKeys;
    // If Redis is empty but connected, seed it
    if (redisKeys !== null && redisKeys.length === 0) {
      await saveKeysToRedis(fileKeys);
    }
    return fileKeys;
  }

  // 3. Fall back to memory cache
  if (memoryKeys && memoryKeys.length > 0) {
    return memoryKeys;
  }

  return [];
}

export async function saveApiKeys(keys: ApiKey[]): Promise<void> {
  memoryKeys = keys;

  const savedRedis = await saveKeysToRedis(keys);
  if (savedRedis) return;

  const savedFile = await saveKeysToFile(keys);
  if (savedFile) return;
}

export async function validateApiKey(key: string): Promise<boolean> {
  const keys = await getAllApiKeys();
  return keys.some((k) => k.key === key);
}

export function generateApiKey(): string {
  return `jw_${randomBytes(32).toString('hex')}`;
}

export async function createApiKey(name: string, createdBy: string): Promise<ApiKey> {
  const keys = await getAllApiKeys();
  const newKey: ApiKey = {
    key: generateApiKey(),
    name,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  keys.push(newKey);
  await saveApiKeys(keys);
  return newKey;
}

export async function deleteApiKey(key: string): Promise<void> {
  const keys = await getAllApiKeys();
  const filtered = keys.filter((k) => k.key !== key);
  await saveApiKeys(filtered);
}
