'use client';

import { PageTitle } from '@/components/PageTitle';
import { getLecturesForModule, getModule } from '@/lib/catalog';
import { ModuleId } from '@/lib/catalog/types';
import { getModuleMetrics } from '@/lib/study/metrics';
import type { Rating10 } from '@/lib/study/types';
import { useStudyState } from '@/lib/study/useStudyState';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function ModuleDetailPage() {
  const params = useParams<{ moduleId: string }>();
  const moduleId = params.moduleId;

  const { state, hydrated, toggleLectureCompleted, setModuleRatings } = useStudyState();

  const modulex = useMemo(() => getModule(moduleId as ModuleId), [moduleId]);
  const lectures = useMemo(() => getLecturesForModule(moduleId as ModuleId), [moduleId]);

  const completedCount = useMemo(() => {
    return lectures.filter((l) => state.completedLectureIds[l.id]).length;
  }, [lectures, state.completedLectureIds]);

  const pct = lectures.length === 0 ? 0 : Math.round((completedCount / lectures.length) * 100);
  const allCompleted = lectures.every((lec) => state.completedLectureIds[lec.id]);
  const metrics = getModuleMetrics(moduleId, lectures, state.completedLectureIds);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Module" subtitle="Loading…" />
      </main>
    );
  }

  if (!modulex) {
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
      <PageTitle
        title={modulex.name}
        subtitle={`  ${metrics.completedLectures}/${metrics.totalLectures} Lectures Complete • ${metrics.backlogMinutes} min left
`}
      />

      <div className="mt-4 h-2 w-full rounded-full bg-[var(--mutedblack)] overflow-hidden">
        <div className="h-full bg-[var(--lightshadow)]" style={{ width: `${pct}%` }} />
      </div>

      <section className="mt-6 flex gap-6">
        <div className="w-full max-w-xl">
          <h2 className="text-lg font-semibold text-[var(--lightshadow)]">Personal Thoughts</h2>
          <div className="mt-4 space-y-5">
            {/* Difficulty */}
            <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-[var(--lightshadow)]">Difficulty</div>
                  <div className="mt-1 text-xs text-[var(--medshadow)]">
                    Author-ish: how hard this module is overall.
                  </div>
                </div>

                <div className="text-sm text-[var(--lightshadow)]">
                  {state.moduleRatings?.[moduleId]?.difficulty ?? 5}/10
                </div>
              </div>

              <input
                className="mt-3 w-full accent-[var(--lightshadow)]"
                type="range"
                min={1}
                max={10}
                step={1}
                value={state.moduleRatings?.[moduleId]?.difficulty ?? 5}
                onChange={(e) =>
                  setModuleRatings(moduleId, Number(e.target.value) as Rating10, undefined)
                }
                aria-label="Difficulty rating"
              />
            </div>

            {/* Comfort */}
            <div className="rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-[var(--lightshadow)]">Comfort</div>
                  <div className="mt-1 text-xs text-[var(--medshadow)]">
                    User-specific: how confident you feel right now.
                  </div>
                </div>

                <div className="text-sm text-[var(--lightshadow)]">
                  {state.moduleRatings?.[moduleId]?.comfort ?? 5}/10
                </div>
              </div>

              <input
                className="mt-3 w-full accent-[var(--lightshadow)]"
                type="range"
                min={1}
                max={10}
                step={1}
                value={state.moduleRatings?.[moduleId]?.comfort ?? 5}
                onChange={(e) =>
                  setModuleRatings(moduleId, undefined, Number(e.target.value) as Rating10)
                }
                aria-label="Comfort rating"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--lightshadow)]">Lectures</h2>

          <button
            type="button"
            onClick={() => {
              lectures.forEach((lec) => {
                const isDone = Boolean(state.completedLectureIds[lec.id]);

                // if all are completed → unset all
                // otherwise → set all
                if (allCompleted && isDone) {
                  toggleLectureCompleted(lec.id);
                } else if (!allCompleted && !isDone) {
                  toggleLectureCompleted(lec.id);
                }
              });
            }}
            className="
        text-sm
        text-[var(--medshadow)]
        hover:text-[var(--lightshadow)]
        transition-colors
      "
          >
            {allCompleted ? 'Mark all incomplete' : 'Mark all complete'}
          </button>
        </div>
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
                      {done ? '✓' : ''}
                    </span>

                    <div>
                      <div className="text-[var(--lightshadow)]">{lec.title}</div>
                      <div className="text-xs text-[var(--medshadow)]">
                        {lec.lengthMinutes} min • {new Date(lec.date).toLocaleString('en-GB')}
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
