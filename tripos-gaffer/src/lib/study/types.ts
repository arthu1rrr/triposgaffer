export type Course ={
    id: string;
    name: string;
    year: 'IA' | 'IB' | 'II' | 'III';
    department: string;
    createdAt: number;
}


export type Module = {
    id: string;
    name: string;
    createdAt: number;
    courseId: string; 
    year: 'IA' | 'IB' | 'II' | 'III'; // e.g Part IA
    difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // optional difficulty rating
    comfort?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // optional comfort rating
}

export type Lecture = {
    id: string;
    moduleId: string;
    title: string;
    index: number; // position within module e.g lecture 5
    date: number; // timestamp
    completed: boolean;
    lengthMinutes: number;
}

export type StudyStateV1 = {
    schemaVersion: 1;
    course: Course | null;
    modules: Module[];
    lectures: Lecture[];

}

export const SCHEMA_VERSION_LATEST = 1 as const;
