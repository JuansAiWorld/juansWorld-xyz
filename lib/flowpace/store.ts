import { promises as fs } from 'fs';
import path from 'path';
import type { Routine, CompletedRoutine, AppSettings } from './types';

const DATA_DIR = process.env.VERCEL
  ? '/tmp/flowpace'
  : path.join(process.cwd(), 'data', 'flowpace');

const ROUTINES_FILE = path.join(DATA_DIR, 'routines.json');
const COMPLETED_FILE = path.join(DATA_DIR, 'completed.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  is_pro: false,
  is_audio_enabled: true,
  is_voice_enabled: false,
  volume: 0.7,
  selected_sound_pack: 'default',
  background_color: 'blue',
};

let memoryRoutines: Routine[] | null = null;
let memoryCompleted: CompletedRoutine[] | null = null;
let memorySettings: AppSettings | null = null;

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // ignore
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const text = await fs.readFile(file, 'utf-8');
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  try {
    await ensureDir();
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch {
    // ignore (read-only fs)
  }
}

export async function getRoutines(): Promise<Routine[]> {
  if (memoryRoutines) return memoryRoutines;
  memoryRoutines = await readJson<Routine[]>(ROUTINES_FILE, []);
  return memoryRoutines;
}

export async function getRoutine(routineId: string): Promise<Routine | undefined> {
  const routines = await getRoutines();
  return routines.find((r) => r.id === routineId);
}

export async function addRoutine(routine: Routine): Promise<Routine> {
  const routines = await getRoutines();
  routines.push(routine);
  memoryRoutines = routines;
  await writeJson(ROUTINES_FILE, routines);
  return routine;
}

export async function updateRoutine(routine: Routine): Promise<Routine | null> {
  const routines = await getRoutines();
  const idx = routines.findIndex((r) => r.id === routine.id);
  if (idx === -1) return null;
  routines[idx] = routine;
  memoryRoutines = routines;
  await writeJson(ROUTINES_FILE, routines);
  return routine;
}

export async function deleteRoutine(routineId: string): Promise<boolean> {
  const routines = await getRoutines();
  const before = routines.length;
  const filtered = routines.filter((r) => r.id !== routineId);
  if (filtered.length === before) return false;
  memoryRoutines = filtered;
  await writeJson(ROUTINES_FILE, filtered);
  return true;
}

export async function reorderRoutines(orderedIds: string[]) {
  const routines = await getRoutines();
  const idMap = new Map(routines.map((r) => [r.id, r]));
  const reordered = orderedIds
    .map((id) => idMap.get(id))
    .filter((r): r is Routine => !!r);
  memoryRoutines = reordered;
  await writeJson(ROUTINES_FILE, reordered);
}

export async function getCompletions(): Promise<CompletedRoutine[]> {
  if (memoryCompleted) return memoryCompleted;
  memoryCompleted = await readJson<CompletedRoutine[]>(COMPLETED_FILE, []);
  return memoryCompleted;
}

export async function recordCompletion(completion: CompletedRoutine) {
  const completions = await getCompletions();
  completions.push(completion);
  memoryCompleted = completions;
  await writeJson(COMPLETED_FILE, completions);
}

export async function getSettings(): Promise<AppSettings> {
  if (memorySettings) return memorySettings;
  memorySettings = await readJson<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
  return memorySettings;
}

export async function updateSettings(settings: AppSettings) {
  memorySettings = settings;
  await writeJson(SETTINGS_FILE, settings);
}
