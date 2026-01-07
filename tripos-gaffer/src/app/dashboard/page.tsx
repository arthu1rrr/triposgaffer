'use client';
import { useMemo, useState} from 'react';
import Link from 'next/link';
import { useStudyState } from '@/lib/study/useStudyState';
import {PageTitle} from '@/components/PageTitle';
import { COURSE_OPTIONS } from '@/lib/courses';
import { SelectField } from '@/components/SelectField';
import { Course } from '@/lib/study/types';
import {uid } from '@/lib/study/id';
import { Button } from '@/components/Button';
import { ModuleCard } from '@/components/ModuleCard';
import { DEMO_COURSE, DEMO_MODULES, DEMO_LECTURES } from '@/lib/demoData';



export default function DashboardPage() {
    
    const { state, setCourse, hydrated } = useStudyState(); //call actions by referencing directly
    
    const [selectedCourseKey, setSelectedCourseKey] = useState<string>('');
    const [selectedPart, setSelectedPart] = useState<string>('');
    const selectedCourse = COURSE_OPTIONS.find(c => c.key === selectedCourseKey);
    console.log('NEXT_PUBLIC_DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);
    console.log('DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE === '1');
    
    const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === '1';
    const course = DEMO_MODE ? DEMO_COURSE : state.course;
    const modules = DEMO_MODE ? DEMO_MODULES : state.modules;
    const lectures = DEMO_MODE ? DEMO_LECTURES : state.lectures;

    const hasCourse = course != null;
    
    

    


    function handleSetCourse() {
        if (!selectedCourse || !selectedPart) return;
        const newCourse: Course = {
            id: uid('course'),
            name: selectedCourse.name,
            year: selectedPart as 'IA' | 'IB' | 'II' | 'III',
            department: selectedCourse.department,
            createdAt: Date.now(),
        };
        setCourse(newCourse);
    }

    const modulesForCourse = useMemo(() => {
    if (!course) return [];
    return modules.filter(m => m.courseId === course.id && m.year === course.year)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
    }, [course, modules]);

    if (!hydrated) {
  return (
    <main className="mx-auto max-w-4xl px-4">
      <PageTitle title="Dashboard" subtitle="Loading…" />
    </main>
  );
}
    
    if (!hasCourse) {
        return (
            <main className = "mx-auto max-w-4xl px-4 ">
            <PageTitle
  title="Set up your course"
  subtitle="Add your course to unlock your dashboard."
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
  placeholder={selectedCourse ? 'Select a part…' : 'Select a course first…'}
  disabled={!selectedCourse}
  onChange={setSelectedPart}
>
  {(selectedCourse?.parts ?? []).map((p) => (
    <option key={p} value={p}>
      Part {p}
    </option>
  ))}
</SelectField>
</div>
<div className="mt-6">
    <Button onClick={handleSetCourse} disabled={!selectedCourse || !selectedPart}>
    Set Course
    </Button>
</div>


</main>

        );
    }
    return (
                    <main className = "mx-auto max-w-4xl px-4 ">

            <PageTitle
  title={`Dashboard`}
  subtitle={`${course?.name} - Part ${course?.year}`}
/>
<section className="mt-6">
<h2 className="text-xl font-semibold mb-4 text-[var(--lightshadow)]">Modules</h2>
{modulesForCourse.length == 0 ? (
    <p className="text-[var(--lightshadow)]">No modules found for this course.</p>
) : (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modulesForCourse.map((mod) => {
        const lecturesForModule = lectures.filter((l) => l.moduleId === mod.id);
        const completed = lecturesForModule.filter((l) => l.completed).length;

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
