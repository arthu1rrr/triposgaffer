import type {
    CourseDefinition,
    ModuleDefinition,
    LectureDefinition,
} from "./types";

export const DEMO_COURSE: CourseDefinition = {
    id: "cs-tripos-demo-2025",
    key: "cs-tripos-demo",
    name: "Computer Science Tripos Demo",
    year: "IB",
    department: "Department of Computer Science and Technology",
    moduleIds: [
        "cs-tripos-demo-2025-algorithms",
        "cs-tripos-demo-2025-oop",
        "cs-tripos-demo-2025-databases",
    ],
};

export const DEMO_MODULES: ModuleDefinition[] = [
    {
        id: "cs-tripos-demo-2025-algorithms",
        courseId: DEMO_COURSE.id,
        name: "Algorithms",
        lectureIds: [
            "cs-tripos-demo-2025-algorithms-01",
            "cs-tripos-demo-2025-algorithms-02",
        ],
    },
    {
        id: "cs-tripos-demo-2025-oop",
        courseId: DEMO_COURSE.id,
        name: "Object-Oriented Programming",
        lectureIds: [
            "cs-tripos-demo-2025-oop-01",
            "cs-tripos-demo-2025-oop-02",
        ],
    },
    {
        id: "cs-tripos-demo-2025-databases",
        courseId: DEMO_COURSE.id,
        name: "Databases",
        lectureIds: [
            "cs-tripos-demo-2025-databases-01",
        ],
    },
];

export const DEMO_LECTURES: LectureDefinition[] = [
    {
        id: "cs-tripos-demo-2025-algorithms-01",
        moduleId: "cs-tripos-demo-2025-algorithms",
        title: "Introduction to Algorithms",
        index: 1,
        date: "2025-02-10T10:00:00Z",
        lengthMinutes: 60,
    },
    {
        id: "cs-tripos-demo-2025-algorithms-02",
        moduleId: "cs-tripos-demo-2025-algorithms",
        title: "Sorting Algorithms",
        index: 2,
        date: "2025-02-17T10:00:00Z",
        lengthMinutes: 60,
    },
    {
        id: "cs-tripos-demo-2025-oop-01",
        moduleId: "cs-tripos-demo-2025-oop",
        title: "Introduction to Object-Oriented Programming",
        index: 1,
        date: "2025-02-11T14:00:00Z",
        lengthMinutes: 90,
    },
    {
        id: "cs-tripos-demo-2025-oop-02",
        moduleId: "cs-tripos-demo-2025-oop",
        title: "Classes and Objects",
        index: 2,
        date: "2025-02-18T14:00:00Z",
        lengthMinutes: 90,
    },
    {
        id: "cs-tripos-demo-2025-databases-01",
        moduleId: "cs-tripos-demo-2025-databases",
        title: "Introduction to Databases",
        index: 1,
        date: "2025-02-12T09:00:00Z",
        lengthMinutes: 120,
    },
];