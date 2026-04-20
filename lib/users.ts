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

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export interface User {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
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
      // Read-only filesystem (e.g., Vercel production without Redis)
      // Return defaults without persisting
    }
    return defaults;
  }
}

async function saveUsersToFile(users: User[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch {
    // Read-only filesystem — silently skip
  }
}

async function ensureDefaultUsers(): Promise<User[]> {
  const { salt, hash } = hashPassword('changeme123');
  return [{ username: 'admin', passwordHash: `${salt}:${hash}`, role: 'admin' }];
}

export async function getUsers(): Promise<User[]> {
  const redisUsers = await getUsersFromRedis();
  if (redisUsers !== null) {
    if (redisUsers.length === 0) {
      const defaults = await ensureDefaultUsers();
      await saveUsersToRedis(defaults);
      return defaults;
    }
    return redisUsers;
  }

  return getUsersFromFile();
}

export async function saveUsers(users: User[]): Promise<void> {
  const saved = await saveUsersToRedis(users);
  if (!saved) {
    await saveUsersToFile(users);
  }
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
