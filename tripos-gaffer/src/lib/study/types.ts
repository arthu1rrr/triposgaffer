import type { CourseId, ModuleId, LectureId } from "@/lib/catalog/types";

export type Rating10 = 1|2|3|4|5|6|7|8|9|10;

export type UserModuleRating = {
    difficulty?: Rating10;
    comfort?: Rating10;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "supervision" | "tick" | "custom";

export type TaskBase = { //Hidden base for all task types
    id: string;
    title: string;
    priority: TaskPriority;
    completed: boolean;
    dueDate: string | null; //ISO date string
    createdAt: string; //ISO date string
    notes?: string;
}

export type CustomTask = TaskBase & {
    type: "custom";
}

export type SupervisionTask = TaskBase & {
    type: "supervision";
    moduleId: ModuleId | null; //null if uncategorized
    svNum: number; // 1,2,3,4
    supervisorId: string;
    work: string; //description of work to be done
    
}
export type TickTask = TaskBase & { //coursework is called ticks
    type: "tick";
    moduleId: ModuleId | null;
}
export type Task = CustomTask | SupervisionTask | TickTask;
    

export type Supervisor = {
    id: string;
    name: string;
    email: string;
}








export type StudyStateV2 = {
    schemaVersion: 2;
    selectedCourseId: CourseId | null;
    
    completedLectureIds: Record<LectureId, true>; //set of completed lecture ids
    lectureMinutesOverride: Record<LectureId, number>; //optional override of lecture length in minutes
    moduleRatings: Record<ModuleId, UserModuleRating>; //user ratings for modules

    //tasks 
    tasks: Task[]; //placeholder for future task implementation
    supervisors: Supervisor[]; //list of supervisors
}
export const SCHEMA_VERSION_LATEST = 2 as const;
export type StudyState = StudyStateV2;

