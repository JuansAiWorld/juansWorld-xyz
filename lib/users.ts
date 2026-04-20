import { promises as fs } from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from './auth';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch {
  redis = null;
}

// Use /tmp on Vercel (writable), otherwise use project data dir
const USERS_FILE = process.env.VERCEL
  ? '/tmp/users.json'
  : path.join(process.cwd(), 'data', 'users.json');

let memoryUsers: User[] | null = null;

export interface User {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export function getStorageStatus() {
  if (redis) return 'redis';
  if (process.env.VERCEL) return 'tmp-file';
  return 'local-file';
}

async function getUsersFromRedis(): Promise<User[] | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<User[]>('users');
    return data || [];
  } catch {
    return null;
  }
}

async function saveUsersToRedis(users: User[]): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.set('users', users);
    return true;
  } catch {
    return false;
  }
}

async function getUsersFromFile(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    const defaults = await ensureDefaultUsers();
    try {
      await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
      await fs.writeFile(USERS_FILE, JSON.stringify(defaults, null, 2));
    } catch {
      // Read-only filesystem — return defaults without persisting
    }
    return defaults;
  }
}

async function saveUsersToFile(users: User[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch {
    return false;
  }
}

async function ensureDefaultUsers(): Promise<User[]> {
  const { salt, hash } = hashPassword('changeme123');
  return [{ username: 'admin', passwordHash: `${salt}:${hash}`, role: 'admin' }];
}

export async function getUsers(): Promise<User[]> {
  // 1. Try Redis
  const redisUsers = await getUsersFromRedis();
  if (redisUsers !== null && redisUsers.length > 0) {
    memoryUsers = redisUsers;
    return redisUsers;
  }

  // 2. Try file
  const fileUsers = await getUsersFromFile();
  if (fileUsers.length > 0) {
    memoryUsers = fileUsers;
    // If Redis is empty but connected, seed it
    if (redisUsers !== null && redisUsers.length === 0) {
      await saveUsersToRedis(fileUsers);
    }
    return fileUsers;
  }

  // 3. Fall back to memory cache
  if (memoryUsers && memoryUsers.length > 0) {
    return memoryUsers;
  }

  // 4. Return defaults
  const defaults = await ensureDefaultUsers();
  memoryUsers = defaults;
  await saveUsersToRedis(defaults);
  await saveUsersToFile(defaults);
  return defaults;
}

export async function saveUsers(users: User[]): Promise<void> {
  memoryUsers = users;

  const savedRedis = await saveUsersToRedis(users);
  if (savedRedis) return;

  const savedFile = await saveUsersToFile(users);
  if (savedFile) return;

  // If nothing else works, at least keep it in memory for this instance
}

export async function findUser(username: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.username === username);
}

export async function verifyUserPassword(username: string, password: string): Promise<boolean> {
  const user = await findUser(username);
  if (!user) return false;
  const parts = user.passwordHash.split(':');
  if (parts.length !== 2) return false;
  return verifyPassword(password, parts[0], parts[1]);
}

export async function createUser(
  username: string,
  password: string,
  role: 'admin' | 'user' = 'user'
): Promise<User> {
  const users = await getUsers();
  if (users.find((u) => u.username === username)) {
    throw new Error('User already exists');
  }
  const { salt, hash } = hashPassword(password);
  const user: User = { username, passwordHash: `${salt}:${hash}`, role };
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function updateUser(
  username: string,
  newUsername?: string,
  password?: string,
  role?: 'admin' | 'user'
): Promise<void> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) throw new Error('User not found');

  if (newUsername && newUsername !== username) {
    if (users.find((u) => u.username === newUsername)) {
      throw new Error('Username already taken');
    }
    users[idx].username = newUsername;
  }

  if (password) {
    const { salt, hash } = hashPassword(password);
    users[idx].passwordHash = `${salt}:${hash}`;
  }

  if (role) {
    users[idx].role = role;
  }

  await saveUsers(users);
}

export async function deleteUser(username: string): Promise<void> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) throw new Error('User not found');
  users.splice(idx, 1);
  await saveUsers(users);
}
