import type { CourseDefinition, LectureDefinition, ModuleDefinition } from './types';

export const DEMO_COURSE: CourseDefinition = {
  id: 'cs-tripos-demo',
  key: 'cs-tripos-demo',
  name: 'Computer Science Tripos Demo',
  year: 'IB',
  department: 'Department of Computer Science and Technology',
  moduleIds: [
    'cs-tripos-demo-algorithms',
    'cs-tripos-demo-oop',
    'cs-tripos-demo-databases',
  ],
};

export const DEMO_MODULES: ModuleDefinition[] = [
  {
    id: 'cs-tripos-demo-algorithms',
    courseId: DEMO_COURSE.id,
    name: 'Algorithms',
    lectureIds: ['cs-tripos-demo-algorithms-01', 'cs-tripos-demo-algorithms-02'],
  },
  {
    id: 'cs-tripos-demo-oop',
    courseId: DEMO_COURSE.id,
    name: 'Object-Oriented Programming',
    lectureIds: ['cs-tripos-demo-oop-01', 'cs-tripos-demo-oop-02'],
  },
  {
    id: 'cs-tripos-demo-databases',
    courseId: DEMO_COURSE.id,
    name: 'Databases',
    lectureIds: ['cs-tripos-demo-databases-01'],
  },
];

export const DEMO_LECTURES: LectureDefinition[] = [
  {
    id: 'cs-tripos-demo-algorithms-01',
    moduleId: 'cs-tripos-demo-algorithms',
    title: 'Introduction to Algorithms',
    index: 1,
    date: '2025-02-10T10:00:00Z',
    lengthMinutes: 60,
  },
  {
    id: 'cs-tripos-demo-algorithms-02',
    moduleId: 'cs-tripos-demo-algorithms',
    title: 'Sorting Algorithms',
    index: 2,
    date: '2025-02-17T10:00:00Z',
    lengthMinutes: 60,
  },
  {
    id: 'cs-tripos-demo-oop-01',
    moduleId: 'cs-tripos-demo-oop',
    title: 'Introduction to Object-Oriented Programming',
    index: 1,
    date: '2025-02-11T14:00:00Z',
    lengthMinutes: 90,
  },
  {
    id: 'cs-tripos-demo-oop-02',
    moduleId: 'cs-tripos-demo-oop',
    title: 'Classes and Objects',
    index: 2,
    date: '2025-02-18T14:00:00Z',
    lengthMinutes: 90,
  },
  {
    id: 'cs-tripos-demo-oop-03',
    moduleId: 'cs-tripos-demo-oop',
    title: 'Classes and Objects part 2',
    index: 3,
    date: '2026-02-25T14:00:00Z',
    lengthMinutes: 90,
  },
  {
    id: 'cs-tripos-demo-databases-01',
    moduleId: 'cs-tripos-demo-databases',
    title: 'Introduction to Databases',
    index: 1,
    date: '2025-02-12T09:00:00Z',
    lengthMinutes: 120,
  },
];
