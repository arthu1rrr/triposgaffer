import { getLecturesForModule } from '@/lib/catalog';
import type { ModuleId } from '@/lib/catalog/types';
import { getModuleMetrics } from '@/lib/study/metrics';
import type { StudyStateV2 } from '@/lib/study/types';
import Link from 'next/link';

type ModuleCardProps = {
  moduleId: ModuleId;
  name: string;
  completedLectureIds: StudyStateV2['completedLectureIds'];
};

export function ModuleCard({ moduleId, name, completedLectureIds }: ModuleCardProps) {
  const lectures = getLecturesForModule(moduleId);
  const { completedLectures, totalLectures, backlogLectures, backlogMinutes } = getModuleMetrics(
    moduleId,
    lectures,
    completedLectureIds,
  );
  const pct = totalLectures === 0 ? 0 : (completedLectures / totalLectures) * 100;
  return (
    <Link
      href={`/modules/${moduleId}`}
      className="block rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4 hover:border-[var(--lightshadow)] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[var(--lightshadow)]">{name}</h3>
        <span className="text-xs text-[var(--medshadow)]">
          {backlogLectures} lectures left ({backlogMinutes} mins)
        </span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-[var(--mutedblack)] overflow-hidden">
        <div className="h-full bg-[var(--lightshadow)]" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2 text-xs text-[var(--medshadow)]">
        {completedLectures}/{totalLectures} lectures
      </div>
    </Link>
  );
}
