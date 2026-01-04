export type Course ={
    id: string;
    name: string;
    department: string;
    createdAt: number;
}


export type Module = {
    id: string;
    name: string;
    createdAt: number;
    courseId: string; 
    year: 'IA' | 'IB' | 'II' | 'III'; // e.g Part IA
}

export type Lecture = {
    id: string;
    moduleId: string;
    title: string;
    date: number; // timestamp
    completed: boolean;
    lengthMinutes: number;
}

export type StudyStateV1 = {
    schemaVersion: 1;
    course: Course;
    modules: Module[];
    lectures: Lecture[];

}

export const SCHEMA_VERSION_LATEST = 1 as const;
