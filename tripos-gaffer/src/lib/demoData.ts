import type { Course, Module, Lecture } from '@/lib/study/types';

export const DEMO_COURSE: Course = {
    id: 'demo-course',
    name: 'Computer Science DEMO Tripos',
    year: 'IB',
    department: 'Department of Computer Science and Technology',
    createdAt: Date.now(),
};

export const DEMO_MODULES: Module[] = [
  {
    id: 'module_demo_algorithms',
    name: 'Algorithms',
    createdAt: Date.now(),
    courseId: DEMO_COURSE.id,
    year: 'IB',
  },
  {
    id: 'module_demo_oop',
    name: 'OOP',
    createdAt: Date.now(),
    courseId: DEMO_COURSE.id,
    year: 'IB',
  },
  {
    id: 'module_demo_databases',
    name: 'Databases',
    createdAt: Date.now(),
    courseId: DEMO_COURSE.id,
    year: 'IB',
  },
];


export const DEMO_LECTURES: Lecture[] = [
  // Algorithms
  {
    id: 'lec_demo_alg_1',
    moduleId: 'module_demo_algorithms',
    title: 'Asymptotics & Recurrences',
    index: 1,
    date: Date.now(),
    completed: true,
    lengthMinutes: 60,
  },
  {
    id: 'lec_demo_alg_2',
    moduleId: 'module_demo_algorithms',
    title: 'Graph Traversal',
    index: 2,
    date: Date.now(),
    completed: false,
    lengthMinutes: 60,
  },

  // OOP
  {
    id: 'lec_demo_oop_1',
    moduleId: 'module_demo_oop',
    title: 'Interfaces & Abstraction',
    index: 1,
    date: Date.now(),
    completed: false,
    lengthMinutes: 60,
  },

  // Databases
  {
    id: 'lec_demo_db_1',
    moduleId: 'module_demo_databases',
    title: 'Relational Model',
    index: 1,
    date: Date.now(),
    completed: true,
    lengthMinutes: 60,
  },
  {
    id: 'lec_demo_db_2',
    moduleId: 'module_demo_databases',
    title: 'SQL Joins',
    index: 2,
    date: Date.now(),
    completed: true,
    lengthMinutes: 60,
  },
];