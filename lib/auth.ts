import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 100000, 32, 'sha256').toString('hex');
  return { salt: s, hash };
}

export function verifyPassword(password: string, salt: string, hashed: string): boolean {
  const { hash } = hashPassword(password, salt);
  return hash === hashed;
}

export function createSession(username: string): string {
  const signature = crypto.createHash('sha256').update(`${username}:${SESSION_SECRET}`).digest('hex').slice(0, 32);
  return `${username}:${signature}`;
}

export async function checkAuth(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) return null;

  const parts = sessionToken.split(':');
  if (parts.length !== 2) return null;

  const [username, signature] = parts;
  const expected = crypto.createHash('sha256').update(`${username}:${SESSION_SECRET}`).digest('hex').slice(0, 32);

  if (signature === expected) {
    return username;
  }
  return null;
}
