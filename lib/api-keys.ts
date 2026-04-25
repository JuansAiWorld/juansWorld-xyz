import { randomBytes } from 'crypto';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  redis = null;
}

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

let memoryKeys: ApiKey[] | null = null;

export async function getAllApiKeys(): Promise<ApiKey[]> {
  const redisKeys = await getKeysFromRedis();
  if (redisKeys !== null) {
    memoryKeys = redisKeys;
    return redisKeys;
  }
  if (memoryKeys) return memoryKeys;
  return [];
}

export async function saveApiKeys(keys: ApiKey[]): Promise<void> {
  memoryKeys = keys;
  await saveKeysToRedis(keys);
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
