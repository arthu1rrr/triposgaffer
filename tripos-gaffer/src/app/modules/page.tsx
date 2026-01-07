"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStudyState } from "@/lib/study/useStudyState";
import { PageTitle } from "@/components/PageTitle";
import { getCourse, getModulesForCourse } from "@/lib/catalog";

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
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageTitle title="Modules" subtitle="Set up your course first on the dashboard." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageTitle title="Modules" subtitle={`${course.name} — Part ${course.year}`} />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--lightshadow)]">Your modules</h2>

        {modules.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--medshadow)]">No modules found.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {modules.map((m) => (
              <li key={m.id} className="rounded-md border border-[var(--mutedblack)] text-[var(--lightshadow)] px-3 py-2">
                <Link
                  href={`/modules/${m.id}`}
                  className="block text-[var(--lightshadow)] hover:underline underline-offset-4"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
