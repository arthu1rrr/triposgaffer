"use client";

import { useMemo, useState } from "react";
import { useStudyState } from "@/lib/study/useStudyState";
import { PageTitle } from "@/components/PageTitle";
import { SelectField } from "@/components/SelectField";
import { Button } from "@/components/Button";
import { COURSE_OPTIONS } from "@/lib/courses";
import { COURSES, getCourse, getModulesForCourse, getLecturesForModule } from "@/lib/catalog/index";
import type { CourseId, Year } from "@/lib/catalog/types";
import { ModuleCard } from "@/components/ModuleCard";

function findCatalogCourseId(courseKey: string, year: Year): CourseId | null {
  // We match on CourseDefinition.key + year
  const match = COURSES.find((c) => c.key === courseKey && c.year === year);
  return match?.id ?? null;
}

export default function DashboardPage() {
  const { state, hydrated, setSelectedCourse } = useStudyState();

  const [selectedCourseKey, setSelectedCourseKey] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<Year | "">("");

  const selectedCourseOption = COURSE_OPTIONS.find((c) => c.key === selectedCourseKey);

  const selectedCourse = state.selectedCourseId ? getCourse(state.selectedCourseId) : null;

  const modulesForCourse = useMemo(() => {
    if (!state.selectedCourseId) return [];
    return getModulesForCourse(state.selectedCourseId);
  }, [state.selectedCourseId]);

  function handleSetCourse() {
    if (!selectedCourseKey || !selectedPart) return;
    const courseId = findCatalogCourseId(selectedCourseKey, selectedPart as Year);
    if (!courseId) return;
    setSelectedCourse(courseId);
  }

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4">
        <PageTitle title="Dashboard" subtitle="Loading…" />
      </main>
    );
  }

  if (!selectedCourse) {
    return (
      <main className="mx-auto max-w-4xl px-4">
        <PageTitle title="Set up your course" subtitle="Pick your course to unlock your dashboard." />

        <div className="mt-6 space-y-4">
          <SelectField
            label="Course"
            value={selectedCourseKey}
            placeholder="Select a course…"
            onChange={(value) => {
              setSelectedCourseKey(value);
              setSelectedPart("");
            }}
          >
            {COURSE_OPTIONS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Part"
            value={selectedPart}
            placeholder={selectedCourseOption ? "Select a part…" : "Select a course first…"}
            disabled={!selectedCourseOption}
            onChange={(value) => setSelectedPart(value as Year)}
          >
            {(selectedCourseOption?.parts ?? []).map((p) => (
              <option key={p} value={p}>
                Part {p}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="mt-6">
          <Button onClick={handleSetCourse} disabled={!selectedCourseKey || !selectedPart}>
            Set Course
          </Button>
        </div>

        {/* Helpful dev hint if catalog isn't wired for that course/year yet */}
        {selectedCourseKey && selectedPart ? (
          <p className="mt-4 text-sm text-[var(--medshadow)]">
            If “Set Course” does nothing, you haven’t added that course/year into your catalog yet.
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4">
      <PageTitle title="Dashboard" subtitle={`${selectedCourse.name} — Part ${selectedCourse.year}`} />

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
        <Button

        onClick={() => setSelectedCourse(null)}
        > Reset Course </Button>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--lightshadow)]">Modules</h2>

        {modulesForCourse.length === 0 ? (
          <p className="text-[var(--lightshadow)]">No modules found for this course.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modulesForCourse.map((mod) => {
              const lecturesForModule = getLecturesForModule(mod.id);
              const completed = lecturesForModule.filter((l) => state.completedLectureIds[l.id]).length;

              return (
                <ModuleCard
                  key={mod.id}
                  moduleId={mod.id}
                  name={mod.name}
                  completedCount={completed}
                  totalCount={lecturesForModule.length}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
