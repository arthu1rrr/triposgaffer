"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { useStudyState } from "@/lib/study/useStudyState";
import { getModule, getLecturesForModule } from "@/lib/catalog";
import { getModuleMetrics } from "@/lib/study/metrics";

export default function ModuleDetailPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params.moduleId;

  const { state, hydrated, toggleLectureCompleted } = useStudyState();

  const module = useMemo(() => getModule(moduleId as any), [moduleId]);
  const lectures = useMemo(() => getLecturesForModule(moduleId as any), [moduleId]);

  const completedCount = useMemo(() => {
    return lectures.filter((l) => state.completedLectureIds[l.id]).length;
  }, [lectures, state.completedLectureIds]);

  const pct = lectures.length === 0 ? 0 : Math.round((completedCount / lectures.length) * 100);
  
  const metrics = getModuleMetrics(
  moduleId,
  lectures,
  state.completedLectureIds
);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Module" subtitle="Loading…" />
      </main>
    );
  }

  if (!module) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Module not found" subtitle="This module doesn’t exist in the catalog." />
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-[var(--lightshadow)] underline underline-offset-4"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle title={module.name} subtitle={`  ${metrics.completedLectures}/${metrics.totalLectures} Lectures Complete • ${metrics.backlogMinutes} min left
`} />

      <div className="mt-4 h-2 w-full rounded-full bg-[var(--mutedblack)] overflow-hidden">
        <div className="h-full bg-[var(--lightshadow)]" style={{ width: `${pct}%` }} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--lightshadow)]">Lectures</h2>

        {lectures.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--medshadow)]">No lectures found.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {lectures.map((lec) => {
              const done = Boolean(state.completedLectureIds[lec.id]);

              return (
                <li
                  key={lec.id}
                  className="flex items-center justify-between gap-4 rounded-md border border-[var(--mutedblack)] px-3 py-2"
                >
                  <button
                    type="button"
                    onClick={() => toggleLectureCompleted(lec.id)}
                    className="flex flex-1 items-start gap-3 text-left"
                  >
                    <span
                      className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded border border-[var(--mutedblack)] text-[var(--lightshadow)]"
                      aria-hidden
                    >
                      {done ? "✓" : ""}
                    </span>

                    <div>
                      <div className="text-[var(--lightshadow)]">{lec.title}</div>
                      <div className="text-xs text-[var(--medshadow)]">
                        {lec.lengthMinutes} min • {new Date(lec.date).toLocaleString("en-GB")}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
