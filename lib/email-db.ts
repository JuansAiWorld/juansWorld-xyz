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

const EMAIL_FILE = process.env.VERCEL
  ? '/tmp/emails.json'
  : path.join(process.cwd(), 'data', 'emails.json');

const MAX_EMAILS = 500;

export interface IncomingEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  receivedAt: string;
  read: boolean;
}

let memoryEmails: IncomingEmail[] | null = null;

async function getEmailsFromRedis(): Promise<IncomingEmail[] | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<IncomingEmail[]>('incoming-emails');
    return data || [];
  } catch {
    return null;
  }
}

async function saveEmailsToRedis(emails: IncomingEmail[]): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('incoming-emails', emails);
    return true;
  } catch {
    return false;
  }
}

async function getEmailsFromFile(): Promise<IncomingEmail[] | null> {
  try {
    const data = await fs.readFile(EMAIL_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveEmailsToFile(emails: IncomingEmail[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(EMAIL_FILE), { recursive: true });
    await fs.writeFile(EMAIL_FILE, JSON.stringify(emails, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function getAllEmails(): Promise<IncomingEmail[]> {
  const redisEmails = await getEmailsFromRedis();
  if (redisEmails !== null) {
    memoryEmails = redisEmails;
    return redisEmails;
  }

  const fileEmails = await getEmailsFromFile();
  if (fileEmails !== null) {
    memoryEmails = fileEmails;
    return fileEmails;
  }

  if (memoryEmails) return memoryEmails;
  return [];
}

async function saveAllEmails(emails: IncomingEmail[]): Promise<void> {
  // Keep under cap — oldest first out
  if (emails.length > MAX_EMAILS) {
    emails.sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
    emails.splice(0, emails.length - MAX_EMAILS);
  }
  // Ensure most-recent-first for API consumers
  emails.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  memoryEmails = emails;

  const savedRedis = await saveEmailsToRedis(emails);
  if (savedRedis) return;

  const savedFile = await saveEmailsToFile(emails);
  if (savedFile) return;
}

export async function addEmail(email: Omit<IncomingEmail, 'id' | 'receivedAt' | 'read'>): Promise<IncomingEmail> {
  const emails = await getAllEmails();
  const newEmail: IncomingEmail = {
    ...email,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    read: false,
  };
  emails.unshift(newEmail);
  await saveAllEmails(emails);
  return newEmail;
}

export async function getEmailById(id: string): Promise<IncomingEmail | null> {
  const emails = await getAllEmails();
  return emails.find((e) => e.id === id) || null;
}

export async function markEmailRead(id: string, read: boolean): Promise<boolean> {
  const emails = await getAllEmails();
  const idx = emails.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  emails[idx].read = read;
  await saveAllEmails(emails);
  return true;
}

export async function deleteEmail(id: string): Promise<boolean> {
  const emails = await getAllEmails();
  const idx = emails.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  emails.splice(idx, 1);
  await saveAllEmails(emails);
  return true;
}
