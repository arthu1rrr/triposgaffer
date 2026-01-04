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


export default function DashboardPage() {
    const { state, setCourse } = useStudyState(); //call actions by referencing directly
    const [selectedCourseKey, setSelectedCourseKey] = useState<string>('');
    const [selectedPart, setSelectedPart] = useState<string>('');
    const selectedCourse = COURSE_OPTIONS.find(c => c.key === selectedCourseKey);
    const hasCourse = state.course !== null;
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
  subtitle={`${state.course?.name} - Part ${state.course?.year}`}
/>

        </main>
    );

}
