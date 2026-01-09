'use client';

import { Button } from '@/components/Button';
import { PageTitle } from '@/components/PageTitle';
import { SelectField } from '@/components/SelectField';
import { COURSE_OPTIONS } from '@/lib/catalog/CourseOptions';
import { COURSES, getCourse, getLecturesForModule, getModulesForCourse } from '@/lib/catalog/index';
import type { CourseId, Year } from '@/lib/catalog/types';
import { getModuleMetrics } from '@/lib/study/metrics';
import { getNextTask, getOverdueTasks, getTasksDueThisWeek } from '@/lib/study/planner';
import { useStudyState } from '@/lib/study/useStudyState';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
function findCatalogCourseId(courseKey: string, year: Year): CourseId | null {
  // We match on CourseDefinition.key + year
  const match = COURSES.find((c) => c.key === courseKey && c.year === year);
  return match?.id ?? null;
}

export default function DashboardPage() {
  console.log('courses', COURSES)
  const { state, hydrated, setSelectedCourse } = useStudyState();

  const [selectedCourseKey, setSelectedCourseKey] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<Year | ''>('');

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
  function useNowMinute() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 60_000);
      return () => clearInterval(id);
    }, []);

    return now;
  }

  const now = useNowMinute();

  const overdueCount = useMemo(() => {
    return getOverdueTasks(state.tasks, now).length;
  }, [state.tasks, now]);
  const totalBacklog = modulesForCourse.reduce(
    (acc, mod) => {
      const lectures = getLecturesForModule(mod.id).filter((lec) => new Date(lec.date) <= now);
      const m = getModuleMetrics(mod.id, lectures, state.completedLectureIds);
      acc.lectures += m.backlogLectures;
      acc.minutes += m.backlogMinutes;
      return acc;
    },
    { lectures: 0, minutes: 0 },
  );
  const dueThisWeekCount = useMemo(() => {
    return getTasksDueThisWeek(state.tasks, now).length;
  }, [state.tasks, now]);

  const nextTask = useMemo(() => {
    return getNextTask(state.tasks, now);
  }, [state.tasks, now]);

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
        <PageTitle
          title="Set up your course"
          subtitle="Pick your course to unlock your dashboard."
        />

        <div className="mt-6 space-y-4">
          <SelectField
            label="Course"
            value={selectedCourseKey}
            placeholder="Select a course…"
            onChange={(value) => {
              setSelectedCourseKey(value);
              setSelectedPart('');
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
            placeholder={selectedCourseOption ? 'Select a part…' : 'Select a course first…'}
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
      <PageTitle
        title="Dashboard"
        subtitle={`${selectedCourse.name} — Part ${selectedCourse.year}`}
      />
      <div className="mb-4 flex items-center justify-between">
        <Button onClick={() => setSelectedCourse(null)}> Reset Course </Button>
      </div>
      <section className="mt-6">
        {' '}
        {/* Display Summary bar */}
        <h2 className="text-xl font-semibold mb-4 text-[var(--lightshadow)]">Summary</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--mutedblack)] bg-[var(--background)]/60 p-3 backdrop-blur transition hover:border-[var(--medshadow)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--medshadow)]">Backlog</div>
              <div className="text-sm font-medium text-[var(--lightshadow)]">
                {totalBacklog.lectures} lectures • {totalBacklog.minutes} min
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--mutedblack)] bg-[var(--background)]/60 p-3 backdrop-blur transition hover:border-[var(--medshadow)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--medshadow)]">Overdue</div>
              <div className="text-sm font-medium text-[var(--lightshadow)]">
                {overdueCount} task{overdueCount === 1 ? '' : 's'} overdue
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--mutedblack)] bg-[var(--background)]/60 p-3 backdrop-blur transition hover:border-[var(--medshadow)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--medshadow)]">Up Next</div>
              <div className="text-sm font-medium text-[var(--lightshadow)]">
                {nextTask ? (
                  <Link href={`/tasks/${nextTask.id}`}>{nextTask.title}</Link>
                ) : (
                  'No upcoming tasks'
                )}
              </div>
            </div>
          </div>
          {/* Later tiles go here */}
          <div className="rounded-xl border border-[var(--mutedblack)] bg-[var(--background)]/60 p-3 backdrop-blur transition hover:border-[var(--medshadow)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--medshadow)]">Due this week</div>
              <div className="text-sm font-medium text-[var(--lightshadow)]">
                {dueThisWeekCount} task{dueThisWeekCount === 1 ? '' : 's'} due this week
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
