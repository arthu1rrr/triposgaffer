'use client';

import { Button } from '@/components/Button';
import { PageTitle } from '@/components/PageTitle';
import { SelectField } from '@/components/SelectField';
import type { CourseDefinition, CourseId, ModuleDefinition, LectureDefinition } from '@/lib/catalog/types';
import { catalogClient } from '@/lib/catalog/client';
import { getModuleMetrics } from '@/lib/study/metrics';
import { getNextTask, getOverdueTasks, getTasksDueThisWeek } from '@/lib/study/planner';
import { useStudyState } from '@/lib/study/useStudyState';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function useNowMinute() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export default function DashboardPage() {
  const { state, hydrated, setSelectedCourse } = useStudyState();

  const now = useNowMinute();

  // ---- Catalog state (DB-backed) ----
  const [allCourses, setAllCourses] = useState<CourseDefinition[] | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourseObj] = useState<CourseDefinition | null>(null);
  const [selectedCourseError, setSelectedCourseError] = useState<string | null>(null);

  const [modulesForCourse, setModulesForCourse] = useState<ModuleDefinition[]>([]);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(''); 
  const courseKeyOptions = useMemo(() => {
  // unique by key, keep display name (CourseDefinition.name)
  const map = new Map<string, string>();
  for (const c of allCourses ?? []) {
    if (!map.has(c.key)) map.set(c.key, c.name);
  }
  return Array.from(map.entries()).map(([key, name]) => ({ key, name }));
}, [allCourses]);

const availableYearsForSelectedKey = useMemo(() => {
  if (!selectedCourseKey) return [];
  const years = (allCourses ?? [])
    .filter((c) => c.key === selectedCourseKey)
    .map((c) => c.year);
  // dedupe + stable order
  return Array.from(new Set(years));
}, [allCourses, selectedCourseKey]);

const canSetCourse = Boolean(selectedCourseKey && selectedYear);

function handleSetCourse() {
  if (!allCourses) return;
  if (!selectedCourseKey || !selectedYear) return;

  const match = allCourses.find(
    (c) => c.key === selectedCourseKey && c.year === selectedYear,
  );

  if (!match) return;

  // optional: clear stale course object to avoid flicker
  setSelectedCourseObj(null);
  setSelectedCourse(match.id as CourseId);
}

  // For backlog we need lectures; temporary solution: fetch per-module (N+1)
  const [lectures, setLectures] = useState<LectureDefinition[]>([]);
const [lecturesError, setLecturesError] = useState<string | null>(null);

const lecturesByModule = useMemo(() => {
  const map: Record<string, LectureDefinition[]> = {};
  for (const lec of lectures) {
    const mid = lec.moduleId;
    (map[mid] ??= []).push(lec);
  }
  return map;
}, [lectures]);

  // Load all courses once (after hydration so this never runs during SSR)
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    (async () => {
      try {
        setCoursesError(null);
        const data = await catalogClient.getAllCourses();
        if (!cancelled) setAllCourses(data);
      } catch (e) {
        if (!cancelled) setCoursesError(e instanceof Error ? e.message : 'Failed to load courses');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  // Load selected course details when state.selectedCourseId changes
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    (async () => {
      if (!state.selectedCourseId) {
        setSelectedCourseObj(null);
        setSelectedCourseError(null);
        return;
      }

      try {
        setSelectedCourseError(null);
        const course = await catalogClient.getCourse(state.selectedCourseId as CourseId);
        if (!cancelled) setSelectedCourseObj(course);
      } catch (e) {
        if (!cancelled) {
          setSelectedCourseObj(null);
          setSelectedCourseError(e instanceof Error ? e.message : 'Failed to load course');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, state.selectedCourseId]);

  // Load modules for selected course
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    (async () => {
      if (!state.selectedCourseId) {
        setModulesForCourse([]);
        setModulesError(null);
        return;
      }

      try {
        setModulesError(null);
        const mods = await catalogClient.listModulesForCourse(state.selectedCourseId as CourseId);
        if (!cancelled) setModulesForCourse(mods);
      } catch (e) {
        if (!cancelled) {
          setModulesForCourse([]);
          setModulesError(e instanceof Error ? e.message : 'Failed to load modules');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, state.selectedCourseId]);

  useEffect(() => {
  if (!hydrated) return;

  let cancelled = false;
  (async () => {
    if (!state.selectedCourseId) {
      setLectures([]);
      setLecturesError(null);
      return;
    }

    try {
      setLecturesError(null);
      const lecs = await catalogClient.listLecturesForCourse(state.selectedCourseId as CourseId);
      if (!cancelled) setLectures(lecs);
    } catch (e) {
      if (!cancelled) {
        setLectures([]);
        setLecturesError(e instanceof Error ? e.message : 'Failed to load lectures');
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}, [hydrated, state.selectedCourseId]);

  // ---- Existing planner/task computations (unchanged) ----
  const overdueCount = useMemo(() => {
    return getOverdueTasks(state.tasks, now).length;
  }, [state.tasks, now]);

  const dueThisWeekCount = useMemo(() => {
    return getTasksDueThisWeek(state.tasks, now).length;
  }, [state.tasks, now]);

  const nextTask = useMemo(() => {
    return getNextTask(state.tasks, now);
  }, [state.tasks, now]);

  const totalBacklog = useMemo(() => {
    return modulesForCourse.reduce(
      (acc, mod) => {
        const lectures = (lecturesByModule[mod.id] ?? []).filter((lec) => new Date(lec.date) <= now);
        const m = getModuleMetrics(mod.id, lectures, state.completedLectureIds);
        acc.lectures += m.backlogLectures;
        acc.minutes += m.backlogMinutes;
        return acc;
      },
      { lectures: 0, minutes: 0 },
    );
  }, [modulesForCourse, lecturesByModule, now, state.completedLectureIds]);

  // ---- UI ----
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4">
        <PageTitle title="Dashboard" subtitle="Loading…" />
      </main>
    );
  }

  if (!state.selectedCourseId || !selectedCourse) {
    return (
      <main className="mx-auto max-w-4xl px-4">
        <PageTitle title="Set up your course" subtitle="Pick your course to unlock your dashboard." />

        <div className="mt-6 space-y-4">
  {coursesError ? <p className="text-sm text-red-400">{coursesError}</p> : null}

  <SelectField
    label="Course"
    value={selectedCourseKey}
    placeholder={!allCourses ? 'Loading…' : 'Select a course…'}
    disabled={!allCourses}
    onChange={(value) => {
      setSelectedCourseKey(value);
      setSelectedYear(''); // reset year when course changes
    }}
  >
    {(courseKeyOptions ?? []).map((c) => (
      <option key={c.key} value={c.key}>
        {c.name}
      </option>
    ))}
  </SelectField>

  <SelectField
    label="Year"
    value={selectedYear}
    placeholder={selectedCourseKey ? 'Select a year…' : 'Select a course first…'}
    disabled={!selectedCourseKey || !allCourses}
    onChange={(value) => setSelectedYear(value)}
  >
    {availableYearsForSelectedKey.map((y) => (
      <option key={y} value={y}>
        Part {y}
      </option>
    ))}
  </SelectField>
</div>

<div className="mt-6">
  <Button onClick={handleSetCourse} disabled={!canSetCourse}>
    Set Course
  </Button>
</div>

        {/* Helpful dev hint */}
        {!allCourses || (allCourses?.length ?? 0) === 0 ? (
          <p className="mt-4 text-sm text-[var(--medshadow)]">
            If this is empty, your DB seed likely hasn’t inserted courseParts/modules yet.
          </p>
        ) : null}

        {selectedCourseError ? (
          <p className="mt-4 text-sm text-red-400">{selectedCourseError}</p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4">
      <PageTitle title="Dashboard" subtitle={`${selectedCourse.name} — Part ${selectedCourse.year}`} />

      <div className="mb-4 flex items-center justify-between">
        <Button onClick={() => setSelectedCourse(null)}>Reset Course</Button>
      </div>

      {/* Optional: surface catalog load issues while developing */}
      {modulesError ? <p className="text-sm text-red-400">{modulesError}</p> : null}
      {lecturesError ? <p className="text-sm text-red-400">{lecturesError}</p> : null}

      <section className="mt-6">
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
                {nextTask ? <Link href={`/tasks/${nextTask.id}`}>{nextTask.title}</Link> : 'No upcoming tasks'}
              </div>
            </div>
          </div>

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
