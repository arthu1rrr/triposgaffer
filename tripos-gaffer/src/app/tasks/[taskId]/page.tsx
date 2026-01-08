'use client';

import { PageTitle } from '@/components/PageTitle';
import type { SupervisionTask, Task, TaskPriority, TickTask } from '@/lib/study/types';
import { useStudyState } from '@/lib/study/useStudyState';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { getModulesForCourse } from '@/lib/catalog';
import type { ModuleDefinition, ModuleId } from '@/lib/catalog/types';

function formatTypeLabel(t: string) {
  if (t === 'custom') return 'Custom';
  if (t === 'tick') return 'Tick';
  if (t === 'supervision') return 'Supervision';
  return t;
}

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const taskId = params?.taskId;

  const { state, hydrated, deleteTask, toggleTaskCompleted, updateTask } = useStudyState();

  const modulesForCourse = useMemo<ModuleDefinition[]>(() => {
    if (!state.selectedCourseId) return [];
    return getModulesForCourse(state.selectedCourseId);
  }, [state.selectedCourseId]);

  const task = useMemo<Task | undefined>(
    () => state.tasks.find((t) => t.id === taskId),
    [state.tasks, taskId],
  );

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

  const dueValue = task.dueDate ?? '';

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <PageTitle title={task.title} subtitle={dueValue ? dueValue.slice(0, 10) : 'No due date'} />

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
                value={dueValue}
                onChange={(e) =>
                  updateTask(task.id, {
                    dueDate: e.target.value ? e.target.value : null,
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
            <SelectField
              label="Module (optional)"
              value={task.moduleId ?? ''}
              placeholder="Select module"
              onChange={(v) =>
                updateTask(task.id, {
                  moduleId: (v ? (v as ModuleId) : null) satisfies ModuleId | null,
                } as Partial<TickTask | SupervisionTask>)
              }
            >
              <option value="">-</option>
              {modulesForCourse.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectField>
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
                    updateTask(task.id, {
                      svNum: v ? Number(v) : 0,
                    } as Partial<SupervisionTask>)
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
                      updateTask(task.id, {
                        supervisorId: e.target.value,
                      } as Partial<SupervisionTask>)
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
                    updateTask(task.id, {
                      work: e.target.value,
                    } as Partial<SupervisionTask>)
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
