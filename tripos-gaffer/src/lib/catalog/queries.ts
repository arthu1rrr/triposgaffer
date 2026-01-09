import { eq , and, inArray } from 'drizzle-orm';
import type {
  CourseDefinition,
  CourseId,
  LectureDefinition,
  LectureId,
  ModuleDefinition,
  ModuleId,
  Year,
} from './types';
import { db } from '@/db/index';
import { courses, lectures, modules, courseParts } from '@/db/schema';

function makeCourseId(key: string, year: Year): CourseId { //makes courseId from key and year
  return `${key}-${year.toLowerCase()}`;
}
function unmakeCourseId(courseId: CourseId): { key: string; year: Year } {
    const lastDashIndex = courseId.lastIndexOf('-');
    const key = courseId.substring(0, lastDashIndex);
    const year = courseId.substring(lastDashIndex + 1).toUpperCase() as Year;
    return { key, year };
    }

async function makeModuleDef(row: typeof modules.$inferSelect): Promise<ModuleDefinition> { 
    const lectureDefs = await listLecturesForModule(row.id as ModuleId);

    return {
        id: row.id as ModuleId,
        courseId: makeCourseId(row.courseId, row.year as Year),
        name: row.name,
        lectureIds: lectureDefs.map(l => l.id as LectureId),
    };
}
function makeLectureDef(row: typeof lectures.$inferSelect): LectureDefinition {
    return {
        id: row.id as LectureId,
        moduleId: row.moduleId as ModuleId,
        title: row.title,
        index: row.index,
        date: row.date, // as ISO string
        lengthMinutes: row.lengthMinutes,
    };
}
 
export async function getCourse(courseId: CourseId): Promise<CourseDefinition> {
    const { key, year } = unmakeCourseId(courseId); 
    const courseRow = await db
    .select()
    .from(courses)
    .where(eq(courses.id,key)) //key is course id in the db
    .then(rows => rows[0]);
    if (!courseRow) {
        throw new Error(`Course with key ${key} not found`);
    }
    const moduleRows = await db
    .select({id: modules.id})
    .from(modules)
    .where(
        and(eq(modules.courseId, key),eq(modules.year, year))
    );
    return {
        id: courseId,
        key: key,
        name: courseRow.name,
        year: year,
        department: courseRow.department,
        moduleIds: moduleRows.map(m => m.id as ModuleId),
    };
}

export async function getModule(moduleId: ModuleId): Promise<ModuleDefinition> {
    const moduleRow = await db
    .select()
    .from(modules)
    .where(eq(modules.id, moduleId))
    .then(rows => rows[0]);
    if (!moduleRow) {
        throw new Error(`Module with id ${moduleId} not found`);
    }
    return makeModuleDef(moduleRow);
}

export async function getLecture(lectureId: LectureId): Promise<LectureDefinition> {
    const lectureRow = await db
    .select()
    .from(lectures)
    .where(eq(lectures.id, lectureId))
    .then(rows => rows[0]);
    if (!lectureRow) {
        throw new Error(`Lecture with id ${lectureId} not found`);
    }
    return makeLectureDef(lectureRow);
}


export async function listModulesForCourse(
  courseId: CourseId,
): Promise<ModuleDefinition[]> {
  const { key, year } = unmakeCourseId(courseId);

  const moduleRows = await db
    .select()
    .from(modules)
    .where(and(eq(modules.courseId, key), eq(modules.year, year)));

  const moduleIds = moduleRows.map((m) => m.id as ModuleId);

  const lectureRows =
    moduleIds.length === 0
      ? []
      : await db
          .select({ id: lectures.id, moduleId: lectures.moduleId })
          .from(lectures)
          .where(inArray(lectures.moduleId, moduleIds));

  const lectureIdsByModule = new Map<ModuleId, LectureId[]>();
  for (const l of lectureRows) {
    const mid = l.moduleId as ModuleId;
    const arr = lectureIdsByModule.get(mid) ?? [];
    arr.push(l.id as LectureId);
    lectureIdsByModule.set(mid, arr);
  }

  return moduleRows.map((m) => ({
    id: m.id as ModuleId,
    courseId: makeCourseId(m.courseId, m.year as Year),
    name: m.name,
    lectureIds: lectureIdsByModule.get(m.id as ModuleId) ?? [],
  }));
}
    
export async function listLecturesForModule(moduleId: ModuleId): Promise<LectureDefinition[]> {
    const lectureRows = await db
    .select()
    .from(lectures)
    .where(eq(lectures.moduleId, moduleId));
    return lectureRows.map(makeLectureDef);
}


export async function isValidCourseId(id: string): Promise<boolean> {
    let key: string;
    let year: Year;
    try {
         ({ key, year } = unmakeCourseId(id as CourseId));
    } catch {
        return false; //invalid format
    }
    //check if key AND year exist in courseParts
    const arthur = await db
    .select()
    .from(courseParts)
    .where(
        and(eq(courseParts.courseId, key), eq(courseParts.year, year))
    )
    .limit(1)
    return arthur.length > 0;
}

export async function isValidModuleId(id: string): Promise<boolean> {
    const arthur = await db
    .select()
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1)
    return arthur.length > 0;
}

export async function isValidLectureId(id: string): Promise<boolean> {
    const arthur = await db
    .select()
    .from(lectures)
    .where(eq(lectures.id, id))
    .limit(1)
    return arthur.length > 0;
}

export async function getAllCourses(): Promise<CourseDefinition[]> {
  const [courseRows, partRows, moduleRows] = await Promise.all([
    db.select().from(courses),
    db.select().from(courseParts),
    db.select({ id: modules.id, courseId: modules.courseId, year: modules.year })
      .from(modules),
  ]);

  const courseByKey = new Map(courseRows.map((c) => [c.id, c] as const));

  // group module IDs by (courseId, year)
  const moduleIdsByCourseYear = new Map<string, ModuleId[]>();
  for (const m of moduleRows) {
    const k = `${m.courseId}__${m.year}`;
    const arr = moduleIdsByCourseYear.get(k) ?? [];
    arr.push(m.id as ModuleId);
    moduleIdsByCourseYear.set(k, arr);
  }

  const out: CourseDefinition[] = [];
  for (const p of partRows) {
    const base = courseByKey.get(p.courseId);
    if (!base) continue;

    const year = p.year as Year;
    const k = `${p.courseId}__${p.year}`;
    const moduleIds = moduleIdsByCourseYear.get(k) ?? [];

    out.push({
      id: makeCourseId(p.courseId, year),
      key: p.courseId,
      name: base.name,
      year,
      department: base.department,
      moduleIds,
    });
  }

  return out;
}


export async function listLecturesForCourse(courseId: CourseId): Promise<LectureDefinition[]> {
    const { key, year } = unmakeCourseId(courseId);
    const moduleRows = await db
    .select({ id: modules.id })
    .from(modules)
    .where(
        and(eq(modules.courseId, key),eq(modules.year, year))
    );
    const moduleIds = moduleRows.map(m => m.id as ModuleId);
    if (moduleIds.length === 0) {
        return [];
    }
    const lectureRows = await db
    .select()
    .from(lectures)
    .where(inArray(lectures.moduleId, moduleIds))
    .orderBy(lectures.moduleId, lectures.index);
    return lectureRows.map(makeLectureDef);
}