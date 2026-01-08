import type { Task } from '@/lib/study/types';

const DAY_MS = 86_400_000;

function startOfTodayUTC(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function parseISO(iso: string): number | null {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

export function getOverdueTasks(tasks: Task[], now: Date): Task[] {
  const todayUTC = startOfTodayUTC(now);

  return tasks.filter((t) => {
    if (t.completed) return false;
    if (!t.dueDate) return false;

    const due = parseISO(t.dueDate);
    if (due === null) return false;

    // overdue if due day is before today (UTC)
    return due < todayUTC;
  });
}

export function getTasksDueThisWeek(tasks: Task[], now: Date): Task[] {
  const startUTC = startOfTodayUTC(now);
  const endUTC = startUTC + 7 * DAY_MS;

  return tasks.filter((t) => {
    if (t.completed) return false;
    if (!t.dueDate) return false;

    const due = parseISO(t.dueDate);
    if (due === null) return false;

    return due >= startUTC && due < endUTC;
  });
}

export function getNextTask(tasks: Task[], now: Date): Task | null {
  const todayUTC = startOfTodayUTC(now);

  const pending = tasks
    .filter((t) => !t.completed && t.dueDate)
    .map((t) => ({ t, due: parseISO(t.dueDate!) }))
    .filter((x): x is { t: Task; due: number } => x.due !== null);

  if (pending.length === 0) return null;

  // Overdue first, then earliest due
  pending.sort((a, b) => {
    const aOver = a.due < todayUTC ? 0 : 1;
    const bOver = b.due < todayUTC ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    return a.due - b.due;
  });
  console.log('Next task:', pending[0].t.title, 'due', new Date(pending[0].due).toISOString());
  return pending[0].t;
}
