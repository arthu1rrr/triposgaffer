import type {
    CourseDefinition, LectureDefinition, ModuleDefinition,
    CourseId, ModuleId, LectureId
} from './types';

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
}

export const catalogClient = {
    async getCourse(courseId: CourseId): Promise<CourseDefinition> {
        return getJson<CourseDefinition>(`/api/catalog/course?id=${encodeURIComponent(courseId)}`);
    },
    async getModule(moduleId: ModuleId): Promise<ModuleDefinition> {
        return getJson<ModuleDefinition>(`/api/catalog/module?id=${encodeURIComponent(moduleId)}`);
    },
    async getLecture(lectureId: LectureId): Promise<LectureDefinition> {
        return getJson<LectureDefinition>(`/api/catalog/lecture?id=${encodeURIComponent(lectureId)}`);
    },
    async isValidCourseId(courseId: CourseId): Promise<boolean> {
        const res = await getJson<{ ok: boolean; valid: boolean }>(
            `/api/catalog/validate?type=course&id=${encodeURIComponent(courseId)}`,
        );
        return res.valid;
    },
    async isValidModuleId(moduleId: ModuleId): Promise<boolean> {
        const res = await getJson<{ ok: boolean; valid: boolean }>(
            `/api/catalog/validate?type=module&id=${encodeURIComponent(moduleId)}`,
        );
        return res.valid;
    },
    async isValidLectureId(lectureId: LectureId): Promise<boolean> {
        const res = await getJson<{ ok: boolean; valid: boolean }>(
            `/api/catalog/validate?type=lecture&id=${encodeURIComponent(lectureId)}`,
        );
        return res.valid;
    },
    async getAllCourses(): Promise<CourseDefinition[]> {
        return getJson<CourseDefinition[]>(`/api/catalog/courses`);
    },
    async listLecturesForModule(moduleId: ModuleId): Promise<LectureDefinition[]> {
        return getJson<LectureDefinition[]>(`/api/catalog/lectures?moduleId=${encodeURIComponent(moduleId)}`);
    },
    async listLecturesForCourse(courseId: CourseId): Promise<LectureDefinition[]> {
  return getJson<LectureDefinition[]>(
    `/api/catalog/lectures?courseId=${encodeURIComponent(courseId)}`
  );
},
    async listModulesForCourse(courseId: CourseId): Promise<ModuleDefinition[]> {
        return getJson<ModuleDefinition[]>(`/api/catalog/modules?courseId=${encodeURIComponent(courseId)}`);
    },
};