'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation'; 
import Link from 'next/link'; 
import { useStudyState } from '@/lib/study/useStudyState';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/Button';

export default function ModulesPage() {
  const params = useParams<{ moduleId: string }>(); 
  const moduleId = params.moduleId;

  const { state, addLecture, toggleLectureCompletion, deleteLecture } = useStudyState();

  const module = useMemo(() => 
state.modules.find((mod) => mod.id === moduleId), [state.modules, moduleId]);

  const lecturesForModule = useMemo(() => {
    return state.lectures.filter((lec) => lec.moduleId === moduleId).slice().sort((a,b) => a.index - b.index);

  }, [state.lectures, moduleId]);

  const completedCount = useMemo(() => {
    return lecturesForModule.filter((lec) => lec.completed).length;
  }, [lecturesForModule]);

  const pct = lecturesForModule.length === 0 ? 0 : Math.round((completedCount / lecturesForModule.length) * 100);

  const [title, setTitle] = useState('');
  const [lengthMinutes, setLengthMinutes] = useState('');

  const canAddLecture = Boolean(module && title.trim().length > 0);
  const nextLectureIndex = lecturesForModule.length + 1;

  function handleAddLecture() {
    if (!module) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    const len = Number(lengthMinutes);
    const safeLen = Number.isFinite(len) && len > 0 ? Math.round(len) : 60;
    addLecture(
      module.id,
      trimmed,
      Date.now(),
      safeLen,
      nextLectureIndex
    );
    setTitle('');
    setLengthMinutes('');
}
    if (!module) {
    return <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle
          title="Module not found"
          subtitle="This module may have been deleted."
        />
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-[var(--lightshadow)] underline underline-offset-4"
        >
          Back to dashboard
        </Link>
      </main>
    
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle
        title={module.name}
        subtitle={`${completedCount}/${lecturesForModule.length} lectures complete (${pct}%)`}
      />

      <div className="mt-4 h-2 w-full rounded-full bg-[var(--mutedblack)] overflow-hidden">
        <div className="h-full bg-[var(--lightshadow)]" style={{ width: `${pct}%` }} />
      </div>

      {/* Add lecture */}
      <section className="mt-8 rounded-md border border-[var(--mutedblack)] p-4">
        <h2 className="text-lg font-semibold text-[var(--lightshadow)]">
          Add a lecture
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[var(--medshadow)]">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-[var(--lightshadow)]"
              placeholder="e.g. Lectures 1–2: Asymptotics"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--medshadow)]">
              Length (minutes)
            </label>
            <input
              inputMode="numeric"
              value={lengthMinutes}
              onChange={(e) => setLengthMinutes(e.target.value)}
              className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-[var(--lightshadow)]"
              placeholder="60"
            />
          </div>

          <Button onClick={handleAddLecture} disabled={!canAddLecture}>
            Add lecture
          </Button>
        </div>
      </section>

      {/* Lectures list */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--lightshadow)]">
          Lectures
        </h2>

        {lecturesForModule.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--medshadow)]">
            No lectures yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {lecturesForModule.map((lec) => (
              <li
                key={lec.id}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--mutedblack)] px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggleLectureCompletion(lec.id)}
                  className="flex flex-1 items-start gap-3 text-left"
                >
                  <span
                    className="
                      mt-1 inline-flex h-4 w-4 items-center justify-center
                      rounded border border-[var(--mutedblack)]
                    "
                    aria-hidden
                  >
                    {lec.completed ? '✓' : ''}
                  </span>

                  <div>
                    <div className="text-[var(--lightshadow)]">{lec.title}</div>
                    <div className="text-xs text-[var(--medshadow)]">
                      {lec.lengthMinutes} min
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => deleteLecture(lec.id)}
                  className="text-xs text-[var(--medshadow)] underline underline-offset-4 hover:text-[var(--lightshadow)]"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

