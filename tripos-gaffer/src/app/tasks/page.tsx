"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { useStudyState } from "@/lib/study/useStudyState";
import type { Task, TaskPriority, TaskType } from "@/lib/study/types";
import { uid } from "@/lib/study/id";
import { SelectField } from "@/components/SelectField";
import { getModulesForCourse } from "@/lib/catalog";




function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isPastDue(task: Task, now = new Date()) {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  return due < startOfToday(now);
}

function dueSortKey(task: Task) {
  if (!task.dueDate) return Number.POSITIVE_INFINITY;
  const t = Date.parse(task.dueDate);
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

function formatDue(dueDate: string | null) {
  if (!dueDate) return "No due date";
  return dueDate.slice(0, 10);
}

function TaskMiniLink({ t }: { t: Task }) {
  return (
    <Link
      href={`/tasks/${t.id}`}
      className="rounded-md border border-[var(--mutedblack)] px-3 py-2 hover:bg-[var(--mutedblack)]/20"
    >
      <div className="truncate text-sm text-[var(--lightshadow)]">{t.title}</div>
      <div className="mt-1 text-[11px] text-[var(--medshadow)]">
        {formatDue(t.dueDate)} • {t.priority} • {t.type}
      </div>
    </Link>
  );
}
function workPreview(t: Task) {
  // Only supervision tasks have `work` in your model, but guard anyway.
  const w = (t as any).work as string | undefined;
  if (!w) return null;
  const trimmed = w.trim();
  if (!trimmed) return null;
  return trimmed.length > 20 ? trimmed.slice(0, 20) + "…" : trimmed;
}
function TaskCard({
  t,
  onToggleCompleted,
}: {
  t: Task;
  onToggleCompleted: (taskId: string) => void;
}) {
  const preview = workPreview(t);
  const overdue = isPastDue(t);

  return (
    <Link
      href={`/tasks/${t.id}`}
      className={[
        "rounded-md border bg-[var(--background)] p-4 hover:bg-[var(--mutedblack)]/20",
        overdue ? "border-red-500/60" : "border-[var(--mutedblack)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // don't follow the Link
            e.stopPropagation();
            onToggleCompleted(t.id);
          }}
          className={[
            "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border",
            t.completed
              ? "border-[var(--lightshadow)] text-[var(--lightshadow)]"
              : "border-[var(--mutedblack)] text-[var(--lightshadow)]",
          ].join(" ")}
          aria-label={t.completed ? "Mark as not completed" : "Mark as completed"}
        >
          {t.completed ? "✓" : ""}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="truncate text-sm font-semibold text-[var(--lightshadow)]">
              {t.title}
            </div>

            {overdue ? (
              <span className="shrink-0 rounded-full border border-red-500/50 px-2 py-0.5 text-[11px] text-red-400">
                Overdue
              </span>
            ) : null}
          </div>

          <div className="mt-1 text-xs text-[var(--medshadow)]">
            {formatDue(t.dueDate)} • {t.type} • {t.priority}
          </div>

          {preview ? (
            <div className="mt-2 text-xs text-[var(--medshadow)]">{preview}</div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function TasksPage() {
  const { state,hydrated, deleteTask, createTask , toggleTaskCompleted} = useStudyState();
  const tasks = state.tasks ?? [];
  

  // Auto-delete: past due AND completed
  useEffect(() => {
    const now = new Date();
    for (const t of tasks) {
      if (t.completed && isPastDue(t, now)) {
        deleteTask(t.id);
      }
    }
  }, [tasks, deleteTask]);

  // Form state
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>(""); // YYYY-MM-DD from <input type="date" />
const [priority, setPriority] = useState<TaskPriority | "">("");
const [type, setType] = useState<TaskType | "">("");
  const [notes, setNotes] = useState("");
  const [moduleId, setModuleId] = useState<string>(""); // "" = none
const [svNum, setSvNum] = useState<string>("1"); // keep as string for <select>
const [supervisorId, setSupervisorId] = useState("");
const [work, setWork] = useState("");
const modulesForCourse = getModulesForCourse(state.selectedCourseId || "");

  function onSubmit(e: React.FormEvent) {
  e.preventDefault();

  const trimmed = title.trim();
  if (!trimmed) return;
  if (!priority) return;
  if (!type) return;

  const base = {
    id: uid(trimmed),
    title: trimmed,
    priority: priority as TaskPriority,
    completed: false,
    // store due date as ISO if provided
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    createdAt: new Date().toISOString(),
    notes: notes.trim() || undefined,
  };

  if (type === "custom") {
    createTask({ ...base, type: "custom" });
  } else if (type === "tick") {
    createTask({
      ...base,
      type: "tick",
      moduleId: moduleId ? (moduleId as any) : null,
    });
  } else {
    // supervision
    const supTrim = supervisorId.trim();
    const workTrim = work.trim();
    if (!supTrim || !workTrim) return;

    const n = Number(svNum);
    const safeSvNum = Number.isFinite(n) ? Math.min(4, Math.max(1, n)) : 1;

    createTask({
      ...base,
      type: "supervision",
      moduleId: moduleId ? (moduleId as any) : null,
      svNum: safeSvNum,
      supervisorId: supTrim,
      work: workTrim,
    });
  }

  // reset
  setTitle("");
  setDueDate("");
  setPriority("");
  setType("");
  setNotes("");
  setModuleId("");
  setSvNum("1");
  setSupervisorId("");
  setWork("");
}

  const {
  active,
  activeTop3,
  activeHighTop3,
  completedNotPastDue,
  pastDueNotCompleted,
} = useMemo(() => {
  const now = new Date();

  const active = tasks
    .filter((t) => !t.completed && !isPastDue(t, now))
    .sort((a, b) => dueSortKey(a) - dueSortKey(b));

  const completedNotPastDue = tasks
    .filter((t) => t.completed && !isPastDue(t, now))
    .sort((a, b) => dueSortKey(a) - dueSortKey(b));

  const pastDueNotCompleted = tasks
    .filter((t) => !t.completed && isPastDue(t, now))
    // oldest due first (most overdue at top)
    .sort((a, b) => dueSortKey(a) - dueSortKey(b));

  const activeTop3 = active.slice(0, 3);
  const activeHighTop3 = active.filter((t) => t.priority === "high").slice(0, 3);

  return {
    active,
    activeTop3,
    activeHighTop3,
    completedNotPastDue,
    pastDueNotCompleted,
  };
}, [tasks]);
  if (!hydrated) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageTitle title="Tasks" />
      <p className="mt-4 text-sm text-[var(--medshadow)]">Loading…</p>
    </main>
  );
}
  if (!state.selectedCourseId) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <PageTitle title="Tasks" />
        <p className="mt-4 text-sm text-[var(--medshadow)]">
          Please select a course in the Dashboard to manage tasks.
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageTitle title="Tasks" />

      {/* Top row: left lists + right create form */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left column */}
        <aside className="grid gap-4">
          <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-3">
            <div className="text-xs font-semibold text-[var(--lightshadow)]">
              Active (soonest due)
            </div>

            {activeTop3.length === 0 ? (
              <div className="mt-2 text-sm text-[var(--medshadow)]">None.</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {activeTop3.map((t) => (
                  <TaskMiniLink key={t.id} t={t} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-3">
            <div className="text-xs font-semibold text-[var(--lightshadow)]">
              Active • High priority
            </div>

            {activeHighTop3.length === 0 ? (
              <div className="mt-2 text-sm text-[var(--medshadow)]">None.</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {activeHighTop3.map((t) => (
                  <TaskMiniLink key={t.id} t={t} />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right column: Create Task form */}
        <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4">
          <div className="text-xs font-semibold text-[var(--lightshadow)]">Add a task</div>

          <form onSubmit={onSubmit} className="mt-3 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-[var(--medshadow)]">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
                placeholder="e.g. Finish tick sheet"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-xs text-[var(--medshadow)]">Due date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
                />
              </label>

              <SelectField
  label="Priority"
  value={priority}
  placeholder="Select priority"
  onChange={(v) => setPriority(v as TaskPriority)}
>
  <option value="low">low</option>
  <option value="medium">medium</option>
  <option value="high">high</option>
</SelectField>
            </div>

            <SelectField
  label="Type"
  value={type}
  placeholder="Select task type"
  onChange={(v) => setType(v as TaskType)}
>
  <option value="custom">custom</option>
  <option value="tick">tick</option>
  <option value="supervision">supervision</option>
</SelectField>
{type === "tick" || type === "supervision" ? (
  <SelectField
    label="Module (optional)"
    value={moduleId}
    placeholder="null"
    onChange={setModuleId}
  >
    {modulesForCourse.map((m) => (
      <option key={m.id} value={m.id}>
        {m.name}
      </option>
    ))}
  </SelectField>
) : null}

{type === "supervision" ? (
  <div className="grid gap-3">
    <div className="grid grid-cols-2 gap-3">
      <SelectField
        label="Supervision #"
        value={svNum}
        placeholder="Select number"
        onChange={setSvNum}
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
      </SelectField>

      <label className="grid gap-1">
        <span className="text-xs text-[var(--medshadow)]">Supervisor ID</span>
        <input
          value={supervisorId}
          onChange={(e) => setSupervisorId(e.target.value)}
          className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
          placeholder="e.g. crsid or name"
        />
      </label>
    </div>

    <label className="grid gap-1">
      <span className="text-xs text-[var(--medshadow)]">Work</span>
      <textarea
        value={work}
        onChange={(e) => setWork(e.target.value)}
        className="min-h-[72px] w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
        placeholder="What needs doing for this supervision?"
      />
    </label>
  </div>
) : null}


            <label className="grid gap-1">
              <span className="text-xs text-[var(--medshadow)]">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[72px] w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--lightshadow)] outline-none"
                placeholder="Any details…"
              />
            </label>

            <button
              type="submit"
              disabled={
  !title.trim() ||
  !priority ||
  !type ||
  (type === "supervision" && (!supervisorId.trim() || !work.trim()))
}
              className="mt-1 inline-flex items-center justify-center rounded-md bg-[var(--blue)] px-4 py-2 text-sm text-[#e6e8f0] disabled:opacity-60"
            >
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="mt-6">
  <div className="flex items-baseline justify-between">
    <h2 className="text-sm font-semibold text-[var(--lightshadow)]">Active</h2>
    <div className="text-xs text-[var(--medshadow)]">{active.length} total</div>
  </div>

  {active.length === 0 ? (
    <div className="mt-3 rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4 text-sm text-[var(--medshadow)]">
      No active tasks.
    </div>
  ) : (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {active.map((t) => (
        <TaskCard key={t.id} t={t} onToggleCompleted={toggleTaskCompleted} />
      ))}
    </div>
  )}
</section>
<section className="mt-6 grid gap-4 lg:grid-cols-2">
  {/* Completed (not past due) */}
  <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4">
    <div className="flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-[var(--lightshadow)]">
        Completed (not past due)
      </h2>
      <div className="text-xs text-[var(--medshadow)]">
        {completedNotPastDue.length}
      </div>
    </div>

    {completedNotPastDue.length === 0 ? (
      <div className="mt-3 text-sm text-[var(--medshadow)]">None.</div>
    ) : (
      <div className="mt-3 grid gap-3">
        {completedNotPastDue.map((t) => (
          <TaskMiniLink key={t.id} t={t} />
        ))}
      </div>
    )}
  </div>

  {/* Past due (not completed) */}
  <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4">
    <div className="flex items-baseline justify-between">
      <h2 className="text-sm font-semibold text-[var(--lightshadow)]">
        Past due (not completed)
      </h2>
      <div className="text-xs text-[var(--medshadow)]">
        {pastDueNotCompleted.length}
      </div>
    </div>

    {pastDueNotCompleted.length === 0 ? (
      <div className="mt-3 text-sm text-[var(--medshadow)]">None.</div>
    ) : (
      <div className="mt-3 grid gap-3">
        {pastDueNotCompleted.map((t) => (
          <TaskMiniLink key={t.id} t={t} />
        ))}
      </div>
    )}
  </div>
</section>
    </main>
  );
}
