import Link from 'next/link';

type ModuleCardProps = {
    moduleId: string;
    name: string;
    completedCount: number;
    totalCount: number;
};

export function ModuleCard({ moduleId, name, completedCount, totalCount }: ModuleCardProps) {
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <Link
            href={`/modules/${moduleId}`}
            className="block rounded-md border border-[var(--mutedblack)] bg-[var(--background)] p-4 hover:border-[var(--lightshadow)] transition"
            >
<div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[var(--lightshadow)]">{name}</h3>
        <span className="text-xs text-[var(--medshadow)]">
          {totalCount === 0 ? '—' : `${completedCount}/${totalCount}`}
        </span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-[var(--mutedblack)] overflow-hidden">
        <div
          className="h-full bg-[var(--lightshadow)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-[var(--medshadow)]">
        {completedCount}/{totalCount} lectures
      </div>
    </Link>
  );
}

