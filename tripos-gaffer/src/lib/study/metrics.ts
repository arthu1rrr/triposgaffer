import type { LectureDefinition, ModuleId } from '@/lib/catalog/types';
import type { StudyState } from './types';

export type ModuleProgressMetrics = {
  completedLectures: number;
  totalLectures: number;
  backlogLectures: number;
  backlogMinutes: number;
};

export function getModuleMetrics(
  moduleId: ModuleId,
  lectures: LectureDefinition[],
  completedLectureIds: StudyState['completedLectureIds'],
): ModuleProgressMetrics {
  const totalLectures = lectures.length;
  let completedLectures = 0;
  let backlogLectures = 0;
  let backlogMinutes = 0;

  for (const lecture of lectures) {
    if (completedLectureIds[lecture.id]) {
      completedLectures += 1;
    } else {
      backlogLectures += 1;
      backlogMinutes += lecture.lengthMinutes;
    }
  }

  return {
    completedLectures,
    totalLectures,
    backlogLectures,
    backlogMinutes,
  };
}
