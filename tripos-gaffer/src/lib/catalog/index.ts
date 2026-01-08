import { DEMO_COURSE, DEMO_LECTURES, DEMO_MODULES } from './cs_demo';
import type {
  CourseDefinition,
  CourseId,
  LectureDefinition,
  LectureId,
  ModuleDefinition,
  ModuleId,
} from './types';

export const COURSES: CourseDefinition[] = [DEMO_COURSE];
export const MODULES: ModuleDefinition[] = [...DEMO_MODULES];
export const LECTURES: LectureDefinition[] = [...DEMO_LECTURES];

const courseById = new Map<CourseId, CourseDefinition>(COURSES.map((c) => [c.id, c]));
const moduleById = new Map<ModuleId, ModuleDefinition>(MODULES.map((m) => [m.id, m]));
const lectureById = new Map<LectureId, LectureDefinition>(LECTURES.map((l) => [l.id, l]));

export function getCourse(courseId: CourseId): CourseDefinition | null {
  return courseById.get(courseId) ?? null;
}
export function getModulesForCourse(courseId: CourseId): ModuleDefinition[] {
  return MODULES.filter((m) => m.courseId === courseId)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getModule(moduleId: ModuleId): ModuleDefinition | null {
  return moduleById.get(moduleId) ?? null;
}

export function getLecturesForModule(moduleId: ModuleId): LectureDefinition[] {
  return LECTURES.filter((l) => l.moduleId === moduleId)
    .slice()
    .sort((a, b) => a.index - b.index);
}

export function getLecture(lectureId: LectureId): LectureDefinition | null {
  return lectureById.get(lectureId) ?? null;
}

export function isValidCourseId(id: string): id is CourseId {
  return courseById.has(id as CourseId);
}
export function isValidModuleId(id: string): id is ModuleId {
  return moduleById.has(id as ModuleId);
}
export function isValidLectureId(id: string): id is LectureId {
  return lectureById.has(id as LectureId);
}
export function listCourseOptions(): Array<{
  id: CourseId;
  key: string;
  name: string;
  year: string;
  department: string;
}> {
  return COURSES.map((c) => ({
    id: c.id,
    key: c.key,
    name: c.name,
    year: c.year,
    department: c.department,
  }));
}
