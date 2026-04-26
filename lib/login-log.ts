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

const LOG_FILE = process.env.VERCEL
  ? '/tmp/login-log.json'
  : path.join(process.cwd(), 'data', 'login-log.json');

const MAX_EVENTS_PER_USER = 100;

export interface LoginEvent {
  username: string;
  action: 'login' | 'logout';
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

let memoryLog: LoginEvent[] | null = null;

async function getLogFromRedis(): Promise<LoginEvent[] | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<LoginEvent[]>('login-log');
    return data || [];
  } catch {
    return null;
  }
}

async function saveLogToRedis(log: LoginEvent[]): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('login-log', log);
    return true;
  } catch {
    return false;
  }
}

async function getLogFromFile(): Promise<LoginEvent[] | null> {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveLogToFile(log: LoginEvent[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.writeFile(LOG_FILE, JSON.stringify(log, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function getLoginLog(): Promise<LoginEvent[]> {
  const redisLog = await getLogFromRedis();
  if (redisLog !== null) {
    memoryLog = redisLog;
    return redisLog;
  }

  const fileLog = await getLogFromFile();
  if (fileLog !== null) {
    memoryLog = fileLog;
    // If Redis is empty but connected, seed it
    const redisData = await redis?.get<LoginEvent[]>('login-log');
    if (redisData !== undefined && redisData !== null && (redisData as LoginEvent[]).length === 0) {
      await saveLogToRedis(fileLog);
    }
    return fileLog;
  }

  if (memoryLog) return memoryLog;
  return [];
}

async function saveLoginLog(log: LoginEvent[]): Promise<void> {
  memoryLog = log;

  const savedRedis = await saveLogToRedis(log);
  if (savedRedis) return;

  const savedFile = await saveLogToFile(log);
  if (savedFile) return;
}

export async function recordLoginEvent(event: LoginEvent): Promise<void> {
  const log = await getLoginLog();
  log.push(event);

  // Cap per user to keep storage low-impact
  const userEvents = log.filter((e) => e.username === event.username);
  if (userEvents.length > MAX_EVENTS_PER_USER) {
    const toRemove = userEvents.length - MAX_EVENTS_PER_USER;
    let removed = 0;
    for (let i = 0; i < log.length && removed < toRemove; i++) {
      if (log[i].username === event.username) {
        log.splice(i, 1);
        i--;
        removed++;
      }
    }
  }

  await saveLoginLog(log);
}

export async function getUserLoginLog(username: string): Promise<LoginEvent[]> {
  const log = await getLoginLog();
  return log
    .filter((e) => e.username === username)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getAllLoginLog(): Promise<LoginEvent[]> {
  const log = await getLoginLog();
  return log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
