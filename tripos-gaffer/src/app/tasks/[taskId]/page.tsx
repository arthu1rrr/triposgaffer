'use client';

import { Button } from '@/components/Button';
import { PageTitle } from '@/components/PageTitle';
import { SelectField } from '@/components/SelectField';
import { catalogClient } from '@/lib/catalog/client';
import type { ModuleDefinition, ModuleId } from '@/lib/catalog/types';
import type { SupervisionTask, Task, TaskPriority, TickTask } from '@/lib/study/types';
import { useStudyState } from '@/lib/study/useStudyState';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

function formatTypeLabel(t: string) {
  if (t === 'custom') return 'Custom';
  if (t === 'tick') return 'Tick';
  if (t === 'supervision') return 'Supervision';
  return t;
}

type ModulesLoad =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; modules: ModuleDefinition[] }
  | { status: 'error'; message: string };

function isoToDateInputValue(iso: string | null | undefined) {
  if (!iso) return '';
  // ISO like 2026-01-09T12:34:56Z -> 2026-01-09
  return iso.slice(0, 10);
}

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const taskId = params?.taskId;

  const { state, hydrated, deleteTask, toggleTaskCompleted, updateTask } = useStudyState();

  const tasks = useMemo(() => state.tasks ?? [], [state.tasks]);

  const task = useMemo<Task | undefined>(
    () => tasks.find((t) => t.id === taskId),
    [tasks, taskId],
  );

  const [modulesLoad, setModulesLoad] = useState<ModulesLoad>({ status: 'idle' });

  useEffect(() => {
    if (!hydrated) return;
    if (!state.selectedCourseId) return;

    let cancelled = false;

    async function run() {
      setModulesLoad({ status: 'loading' });
      try {
        if (state.selectedCourseId === null) {
          const mods = [];
          return;
        }
        const mods = await catalogClient.listModulesForCourse(state.selectedCourseId);
        if (cancelled) return;
        setModulesLoad({ status: 'loaded', modules: mods });
      } catch (e) {
        if (cancelled) return;
        setModulesLoad({
          status: 'error',
          message: e instanceof Error ? e.message : 'Failed to load modules',
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [hydrated, state.selectedCourseId]);

  const modulesForCourse = modulesLoad.status === 'loaded' ? modulesLoad.modules : [];

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="text-sm text-[var(--muted)]">Loading…</div>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-4">
          <Link href="/tasks" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">
            ← Tasks
          </Link>
        </div>

        <PageTitle title="Task Not Found" subtitle="OHHH MICHAEL VAN GERWEN" />
        <p className="mt-2 text-[var(--muted)]">This task may have been deleted.</p>
      </main>
    );
  }

  const dueInputValue = isoToDateInputValue(task.dueDate);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 ">
      <PageTitle
        title={task.title}
        subtitle={dueInputValue ? dueInputValue : 'No due date'}
      />

      {/* Details card */}
      <div className="mt-6 rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4">
        <div className="flex items-center">
          <div className="text-xs font-semibold text-[var(--lightshadow)]">Task</div>

          {/* Complete toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleTaskCompleted(task.id);
            }}
            className={[
              'ml-auto inline-flex h-5 w-5 items-center justify-center rounded border',
              task.completed
                ? 'border-[var(--lightshadow)] text-[var(--lightshadow)]'
                : 'border-[var(--mutedblack)] text-[var(--lightshadow)]',
            ].join(' ')}
            aria-label={task.completed ? 'Mark as not completed' : 'Mark as completed'}
            title={task.completed ? 'Completed' : 'Active'}
          >
            {task.completed ? '✓' : ''}
          </button>
        </div>

        <form className="mt-3 grid gap-3">
          {/* Title */}
          <label className="grid gap-1">
            <span className="text-xs text-[var(--medshadow)]">Title</span>
            <input
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
              placeholder="e.g. Finish tick sheet"
            />
          </label>

          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--medshadow)]">
              {formatTypeLabel(task.type)}
            </span>
            <span className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--medshadow)]">
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>

          {/* Due + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-[var(--medshadow)]">Due date</span>
              <input
                type="date"
                value={dueInputValue}
                onChange={(e) =>
                  updateTask(task.id, {
                    // keep storage consistent: ISO or null
                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
              />
            </label>

            <SelectField
              label="Priority"
              value={task.priority}
              placeholder="Select priority"
              onChange={(v) => updateTask(task.id, { priority: v as TaskPriority })}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </SelectField>
          </div>

          {/* Type (read-only) */}
          <label className="grid gap-1">
            <span className="text-xs text-[var(--medshadow)]">Type</span>
            <input
              value={formatTypeLabel(task.type)}
              disabled
              className="w-full cursor-not-allowed rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] opacity-70 outline-none"
            />
          </label>

          {/* Module (tick + supervision) */}
          {task.type === 'tick' || task.type === 'supervision' ? (
            <>
              <SelectField
                label="Module (optional)"
                value={task.moduleId ?? ''}
                placeholder="Select module"
                onChange={(v) =>
                  updateTask(
                    task.id,
                    {
                      moduleId: (v ? (v as ModuleId) : null) satisfies ModuleId | null,
                    } as Partial<TickTask | SupervisionTask>,
                  )
                }
              >
                <option value="">None</option>
                {modulesForCourse.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </SelectField>

              {modulesLoad.status === 'loading' ? (
                <div className="-mt-2 text-xs text-[var(--medshadow)]">Loading modules…</div>
              ) : modulesLoad.status === 'error' ? (
                <div className="-mt-2 text-xs text-red-400">{modulesLoad.message}</div>
              ) : null}
            </>
          ) : null}

          {/* Supervision-only fields */}
          {task.type === 'supervision' ? (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Supervision #"
                  value={task.svNum ? String(task.svNum) : ''}
                  placeholder="Select number"
                  onChange={(v) =>
                    updateTask(
                      task.id,
                      {
                        // keep within 1..4, or 0 if blank (but you might prefer null)
                        svNum: v ? Number(v) : 0,
                      } as Partial<SupervisionTask>,
                    )
                  }
                >
                  <option value="">-</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </SelectField>

                <label className="grid gap-1">
                  <span className="text-xs text-[var(--medshadow)]">Supervisor ID</span>
                  <input
                    value={task.supervisorId ?? ''}
                    onChange={(e) =>
                      updateTask(
                        task.id,
                        { supervisorId: e.target.value } as Partial<SupervisionTask>,
                      )
                    }
                    className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
                    placeholder="e.g. crsid or name"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs text-[var(--medshadow)]">Work</span>
                <textarea
                  value={task.work ?? ''}
                  onChange={(e) =>
                    updateTask(task.id, { work: e.target.value } as Partial<SupervisionTask>)
                  }
                  className="min-h-[72px] w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
                  placeholder="What needs doing for this supervision?"
                />
              </label>
            </div>
          ) : null}

          {/* Notes */}
          <label className="grid gap-1">
            <span className="text-xs text-[var(--medshadow)]">Notes (optional)</span>
            <textarea
              value={task.notes ?? ''}
              onChange={(e) => updateTask(task.id, { notes: e.target.value })}
              className="min-h-[72px] w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
              placeholder="Any details…"
            />
          </label>
        </form>
      </div>

      <div className="mt-6" />

      <Button
        onClick={() => {
          if (!confirm('Delete this task? This cannot be undone.')) return;
          deleteTask(task.id);
          router.push('/tasks');
        }}
      >
        Delete
      </Button>
    </main>
  );
}
