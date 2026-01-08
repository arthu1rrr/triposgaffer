"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStudyState } from "@/lib/study/useStudyState";
import { PageTitle } from "@/components/PageTitle";
import { getCourse, getModulesForCourse } from "@/lib/catalog";
import { ModuleCard } from "@/components/ModuleCard";

export default function ModulesPage() {
  const { state, hydrated } = useStudyState();

  const course = state.selectedCourseId ? getCourse(state.selectedCourseId) : null;

  const modules = useMemo(() => {
    if (!state.selectedCourseId) return [];
    return getModulesForCourse(state.selectedCourseId);
  }, [state.selectedCourseId]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Modules" subtitle="Loading…" />
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto max-w-4xl px-4 ">
        <PageTitle title="Modules" subtitle="Set up your course first on the dashboard." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 ">
      <PageTitle title="Modules" subtitle={`${course.name} — Part ${course.year}`} />

      <section className="mt-6">
        
        <h2 className="text-xl font-semibold mb-4 text-[var(--lightshadow)]">Modules</h2>

        {modules.length === 0 ? (
          <p className="text-[var(--lightshadow)]">No modules found for this course.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => {
              

              return (
                <ModuleCard
                  key={mod.id}
                  moduleId={mod.id}
                  name={mod.name}
                  completedLectureIds={state.completedLectureIds}
                  
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
