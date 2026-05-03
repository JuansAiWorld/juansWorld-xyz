import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/auth';
import * as store from '@/lib/flowpace/store';
import { BUILTIN_PACKS } from '@/lib/flowpace/types';
import type { Routine, RoutineItem, Step, CompletedRoutine, AppSettings } from '@/lib/flowpace/types';

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function requireAuth() {
  return checkAuth();
}

function flattenRoutine(routine: Routine): Step[] {
  const steps: Step[] = [];
  for (const item of routine.steps) {
    if (item.type === 'step' && item.duration > 0) {
      steps.push({ id: item.id, name: item.name, duration: item.duration, color: item.color });
    } else if (item.type === 'group' && item.steps) {
      for (let i = 0; i < (item.loop_count || 1); i++) {
        for (const s of item.steps) {
          if (s.duration > 0) {
            steps.push({ id: s.id, name: s.name, duration: s.duration, color: s.color });
          }
        }
      }
    }
  }
  return steps;
}

function getStartOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfMonth(d: Date): Date {
  const start = new Date(d);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getStartOfYear(d: Date): Date {
  const start = new Date(d);
  start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

async function getAnalytics(timeRange: string) {
  const completions = await store.getCompletions();
  const now = new Date();

  let start: Date;
  if (timeRange === 'week') {
    start = getStartOfWeek(now);
  } else if (timeRange === 'month') {
    start = getStartOfMonth(now);
  } else if (timeRange === 'year') {
    start = getStartOfYear(now);
  } else {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const filtered = completions.filter((c) => new Date(c.completed_at) >= start);
  const totalSessions = filtered.length;
  const totalTime = filtered.reduce((a, c) => a + c.total_duration, 0);
  const avgDuration = totalSessions ? totalTime / totalSessions : 0;

  // streak
  const sorted = [...completions].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  let streak = 0;
  let checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);
  const seen = new Set<string>();
  for (const c of sorted) {
    const d = new Date(c.completed_at);
    d.setHours(0, 0, 0, 0);
    const dStr = d.toISOString().slice(0, 10);
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.getTime() === checkDate.getTime() || (d.getTime() === yesterday.getTime() && !seen.has(dStr))) {
      if (!seen.has(dStr)) {
        streak++;
        seen.add(dStr);
        checkDate = new Date(d);
      }
    } else {
      break;
    }
  }

  // breakdown
  const bd: Record<string, { count: number; total_time: number }> = {};
  for (const c of filtered) {
    if (!bd[c.routine_name]) bd[c.routine_name] = { count: 0, total_time: 0 };
    bd[c.routine_name].count++;
    bd[c.routine_name].total_time += c.total_duration;
  }
  const breakdown = Object.entries(bd)
    .map(([name, v]) => ({ name, count: v.count, total_time: v.total_time }))
    .sort((a, b) => b.count - a.count);

  return {
    total_sessions: totalSessions,
    total_time: totalTime,
    avg_duration: avgDuration,
    streak,
    breakdown,
    completions: filtered.map((c) => ({
      routine_name: c.routine_name,
      total_duration: c.total_duration,
      completed_at: c.completed_at,
    })),
  };
}

async function handleRequest(request: NextRequest, path: string[], method: string) {
  const username = await requireAuth();
  if (!username) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // ---------- Routines ----------
    if (path[0] === 'routines') {
      // /api/flowpace/routines/reorder
      if (path[1] === 'reorder' && method === 'POST') {
        const body = await request.json();
        await store.reorderRoutines(body.ordered_ids || []);
        return NextResponse.json({ ok: true });
      }

      // /api/flowpace/routines/:id/...
      if (path[1] && path[1] !== 'reorder') {
        const routineId = path[1];

        if (path[2] === 'duplicate' && method === 'POST') {
          const source = await store.getRoutine(routineId);
          if (!source) return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
          const dup: Routine = {
            id: uuid(),
            name: `${source.name} (Copy)`,
            steps: source.steps.map((item) => ({
              ...item,
              id: uuid(),
              steps: item.steps?.map((s) => ({ ...s, id: uuid() })),
            })),
          };
          await store.addRoutine(dup);
          return NextResponse.json(dup);
        }

        if (path[2] === 'flatten' && method === 'GET') {
          const routine = await store.getRoutine(routineId);
          if (!routine) return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
          return NextResponse.json(flattenRoutine(routine));
        }

        if (method === 'GET') {
          const routine = await store.getRoutine(routineId);
          if (!routine) return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
          return NextResponse.json(routine);
        }

        if (method === 'PUT') {
          const body = await request.json();
          if (routineId !== body.id) {
            return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
          }
          const updated = await store.updateRoutine(body);
          if (!updated) return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
          return NextResponse.json(updated);
        }

        if (method === 'DELETE') {
          const ok = await store.deleteRoutine(routineId);
          if (!ok) return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
          return NextResponse.json({ ok: true });
        }
      }

      // /api/flowpace/routines
      if (method === 'GET') {
        return NextResponse.json(await store.getRoutines());
      }
      if (method === 'POST') {
        const body = await request.json();
        const routine: Routine = { id: uuid(), name: body.name, steps: body.steps || [] };
        await store.addRoutine(routine);
        return NextResponse.json(routine);
      }
    }

    // ---------- Completions ----------
    if (path[0] === 'completions') {
      if (method === 'GET') {
        return NextResponse.json(await store.getCompletions());
      }
      if (method === 'POST') {
        const body = await request.json();
        const completion: CompletedRoutine = {
          id: uuid(),
          routine_name: body.routine_name,
          total_duration: body.total_duration,
          completed_at: new Date().toISOString(),
        };
        await store.recordCompletion(completion);
        return NextResponse.json(completion);
      }
    }

    // ---------- Analytics ----------
    if (path[0] === 'analytics' && method === 'GET') {
      const url = new URL(request.url);
      const timeRange = url.searchParams.get('time_range') || 'week';
      return NextResponse.json(await getAnalytics(timeRange));
    }

    // ---------- Settings ----------
    if (path[0] === 'settings') {
      if (method === 'GET') {
        return NextResponse.json(await store.getSettings());
      }
      if (method === 'PUT') {
        const body = await request.json();
        await store.updateSettings(body);
        return NextResponse.json(body);
      }
    }

    // ---------- Sound Packs ----------
    if (path[0] === 'soundpacks' && method === 'GET') {
      return NextResponse.json(BUILTIN_PACKS);
    }

    // ---------- Sync ----------
    if (path[0] === 'sync') {
      if (method === 'GET') {
        return NextResponse.json({
          routines: await store.getRoutines(),
          completions: await store.getCompletions(),
          settings: await store.getSettings(),
        });
      }
      if (method === 'POST') {
        const body = await request.json();
        // Overwrite server data with client data
        for (const r of body.routines || []) {
          const existing = await store.getRoutine(r.id);
          if (existing) await store.updateRoutine(r);
          else await store.addRoutine(r);
        }
        const clientIds = new Set((body.routines || []).map((r: Routine) => r.id));
        const serverRoutines = await store.getRoutines();
        for (const r of serverRoutines) {
          if (!clientIds.has(r.id)) await store.deleteRoutine(r.id);
        }
        for (const c of body.completions || []) {
          await store.recordCompletion(c);
        }
        if (body.settings) await store.updateSettings(body.settings);
        return NextResponse.json({ ok: true });
      }
    }

    // ---------- Seed ----------
    if (path[0] === 'seed' && method === 'POST') {
      const routines = await store.getRoutines();
      if (routines.length) {
        return NextResponse.json({ seeded: false });
      }
      const sample: Routine[] = [
        {
          id: uuid(),
          name: 'Quick HIIT',
          steps: [
            { id: uuid(), type: 'step', name: 'Jumping Jacks', duration: 30, color: 'red' },
            { id: uuid(), type: 'step', name: 'Rest', duration: 15, color: 'green' },
            { id: uuid(), type: 'step', name: 'Burpees', duration: 30, color: 'orange' },
            { id: uuid(), type: 'step', name: 'Rest', duration: 15, color: 'green' },
            { id: uuid(), type: 'step', name: 'Mountain Climbers', duration: 30, color: 'blue' },
            { id: uuid(), type: 'step', name: 'Rest', duration: 15, color: 'green' },
          ],
        },
        {
          id: uuid(),
          name: 'Study Pomodoro',
          steps: [
            { id: uuid(), type: 'step', name: 'Focus', duration: 25 * 60, color: 'blue' },
            { id: uuid(), type: 'step', name: 'Short Break', duration: 5 * 60, color: 'green' },
            { id: uuid(), type: 'step', name: 'Focus', duration: 25 * 60, color: 'blue' },
            { id: uuid(), type: 'step', name: 'Short Break', duration: 5 * 60, color: 'green' },
            { id: uuid(), type: 'step', name: 'Focus', duration: 25 * 60, color: 'blue' },
            { id: uuid(), type: 'step', name: 'Long Break', duration: 15 * 60, color: 'purple' },
          ],
        },
        {
          id: uuid(),
          name: 'Tabata Workout',
          steps: [
            {
              id: uuid(),
              type: 'group',
              name: 'Tabata Round',
              duration: 240,
              color: 'purple',
              steps: [
                { id: uuid(), name: 'Work', duration: 20, color: 'red' },
                { id: uuid(), name: 'Rest', duration: 10, color: 'green' },
              ],
              loop_count: 8,
            },
          ],
        },
      ];
      for (const r of sample) {
        await store.addRoutine(r);
      }
      return NextResponse.json({ seeded: true, count: sample.length });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path || [], 'GET');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path || [], 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path || [], 'PUT');
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  return handleRequest(request, path || [], 'DELETE');
}
