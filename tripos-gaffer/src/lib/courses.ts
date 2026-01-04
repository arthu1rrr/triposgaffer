export type CourseOption = {
    key: string;
    name: string;
    department: string;
    parts: Array<'IA' | 'IB' | 'II' | 'III'>;
};

export const COURSE_OPTIONS: CourseOption[] = [
    {
        key: 'cs-tripos',
        name: 'Computer Science Tripos',
        department: 'Department of Computer Science and Technology',
        parts: ['IA', 'IB', 'II', 'III'],
    },
];

