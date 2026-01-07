import type { CourseId, ModuleId, LectureId } from "@/lib/catalog/types";

export type Rating10 = 1|2|3|4|5|6|7|8|9|10;

export type UserModuleRating = {
    difficulty?: Rating10;
    comfort?: Rating10;
}
export type Task = never; //placeholder for future task implementation
export type StudyStateV2 = {
    schemaVersion: 2;
    selectedCourseId: CourseId | null;
    
    completedLectureIds: Record<LectureId, true>; //set of completed lecture ids
    lectureMinutesOverride: Record<LectureId, number>; //optional override of lecture length in minutes
    moduleRatings: Record<ModuleId, UserModuleRating>; //user ratings for modules

    //tasks 
    tasks: []; //placeholder for future task implementation
}
export const SCHEMA_VERSION_LATEST = 2 as const;
export type StudyState = StudyStateV2;

