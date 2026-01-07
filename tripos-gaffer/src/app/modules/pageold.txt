'use client';

import { useMemo, useState } from 'react';
import { useStudyState } from '@/lib/study/useStudyState';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/Button';

export default function ModulesPage() {
  const { state, addModule,  } = useStudyState();

  const [name, setName] = useState('');

  const canAdd = Boolean(state.course && name.trim().length > 0);

  const modulesSorted = useMemo(() => {
    return state.modules
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.modules]);

  function handleAddModule() {
    if (!state.course) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    // uses the user's current course + part
    addModule(
      state.course.id,
      trimmed,
      state.course.year,
    );

    setName('');
  }

  if (!state.course) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle
          title="Modules"
          subtitle="Set up your course first on the dashboard."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle
        title="Modules"
        subtitle={`${state.course.name} — Part ${state.course.year}`}
      />

      <section className="mt-6 rounded-md border border-[var(--mutedblack)] p-4">
        <label className="block text-sm mb-1 text-[var(--medshadow)]">
          Module name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-[var(--mutedblack)] bg-[var(--background)] px-3 py-2 text-[var(--lightshadow)]"
          placeholder="e.g. Algorithms"
        />

        <div className="mt-4">
          <Button onClick={handleAddModule} disabled={!canAdd}>
            Add module
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--lightshadow)]">
          Your modules
        </h2>

        {modulesSorted.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--medshadow)]">
            No modules yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {modulesSorted.map((m) => (
              <li
                key={m.id}
                className="rounded-md border border-[var(--mutedblack)] px-3 py-2"
              >
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--lightshadow)]">{m.name}</span>
                  <span className="text-sm text-[var(--medshadow)]">
                    {m.courseId === state.course?.id ? `Part ${m.year}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
