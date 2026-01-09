'use client';

import { ModuleCard } from '@/components/ModuleCard';
import { PageTitle } from '@/components/PageTitle';
import { catalogClient } from '@/lib/catalog/client';
import type { LectureDefinition, ModuleDefinition } from '@/lib/catalog/types';
import { useStudyState } from '@/lib/study/useStudyState';
import { useEffect, useMemo, useState } from 'react';

type LoadState =
  | { status: 'idle' } // no course selected
  | { status: 'loading' }
  | {
      status: 'loaded';
      courseName: string;
      modules: ModuleDefinition[];
      lectures: LectureDefinition[];
    }
  | { status: 'error'; message: string };

export default function ModulesPage() {
  const { state, hydrated } = useStudyState();

  const courseId = state.selectedCourseId; // e.g cs-tripos-ib
  // derive year from courseId

  const [load, setLoad] = useState<LoadState>({ status: 'idle' });

  useEffect(() => {
    if (!courseId) {
      setLoad({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setLoad({ status: 'loading' });

    (async () => {
      try {
        const [course, modulesAll, lecturesAll] = await Promise.all([
          catalogClient.getCourse(courseId),
          catalogClient.listModulesForCourse(courseId),
          catalogClient.listLecturesForCourse(courseId),
        ]);

        if (cancelled) return;

        setLoad({
          status: 'loaded',
          courseName: course.name,
          modules: modulesAll,
          lectures: lecturesAll,
        });
      } catch (e) {
        if (cancelled) return;
        setLoad({
          status: 'error',
          message: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const modules = useMemo(() => {
    if (load.status !== 'loaded') return [];
     return load.modules;

    // assuming ModuleDefinition has `year`
  }, [load]);

  const lecturesByModuleId = useMemo(() => {
    const map = new Map<string, LectureDefinition[]>();
    if (load.status !== 'loaded') return map;

    for (const lec of load.lectures) {
      const arr = map.get(lec.moduleId) ?? [];
      arr.push(lec);
      map.set(lec.moduleId, arr);
    }

    // optional: sort by index if you have it
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    }

    return map;
  }, [load]);

  if (!hydrated || load.status === 'loading') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Modules" subtitle="Loading…" />
      </main>
    );
  }

  if (!courseId) {
    return (
      <main className="mx-auto max-w-4xl px-4">
        <PageTitle title="Modules" subtitle="Set up your course first on the dashboard." />
      </main>
    );
  }

  if (load.status === 'error') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Modules" subtitle={`Couldn’t load modules: ${load.message}`} />
      </main>
    );
  }

  if (load.status !== 'loaded') {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4">
      <PageTitle
        title="Modules"
        subtitle={`${load.courseName} - ${courseId.split('-').pop()?.toUpperCase()}`}
      />

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-semibold text-[var(--lightshadow)]">Modules</h2>

        {modules.length === 0 ? (
          <p className="text-[var(--lightshadow)]">No modules found for this course.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                moduleId={mod.id}
                name={mod.name}
                lectures={lecturesByModuleId.get(mod.id) ?? []}
                completedLectureIds={state.completedLectureIds}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
