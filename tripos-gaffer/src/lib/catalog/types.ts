export type CourseId = string;

export type ModuleId = string;

export type LectureId = string;
export type Year = 'IA' | 'IB' | 'II' | 'III';

export type CourseDefinition = {
  id: CourseId; //e.g cs-tripos-ib-2025
  key: string; //e.g cs-tripos
  name: string; //e.g Computer Science Tripos
  year: Year; //e.g IB
  department: string; //e.g Department of Computer Science and Technology
  moduleIds: ModuleId[]; //list of module ids belonging to this course
};

export type ModuleDefinition = {
  id: ModuleId; //e.g cs-tripos-ib-2025-further_graphics
  courseId: CourseId; //e.g cs-tripos-ib-2025
  name: string; //e.g Further Graphics
  lectureIds: LectureId[]; //list of lecture ids belonging to this module
};

export type LectureDefinition = {
  id: LectureId; //e.g cs-tripos-ib-2025-further_graphics-01
  moduleId: ModuleId; //e.g cs-tripos-ib-2025-further_graphics
  title: string; //e.g Introduction to Further Graphics
  index: number; //e.g 1 (position within module)
  date: string; //ISO date and time e.g 2025-02-10T10:00:00Z
  lengthMinutes: number; //e.g 60
};
