import type {
  IncidentSeverity,
  IncidentStatus,
} from '../types/incident';

type BadgeKind = 'severity' | 'status';

const styles: Record<BadgeKind, Record<string, string>> = {
  severity: {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    medium: 'border-sky-200 bg-sky-50 text-sky-700',
    high: 'border-amber-200 bg-amber-50 text-amber-700',
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  status: {
    open: 'border-blue-200 bg-blue-50 text-blue-700',
    investigating: 'border-violet-200 bg-violet-50 text-violet-700',
    resolved: 'border-slate-200 bg-slate-100 text-slate-700',
  },
};

export function IncidentBadge({
  kind,
  value,
}: {
  kind: BadgeKind;
  value: IncidentSeverity | IncidentStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2.5 text-xs font-semibold capitalize ${styles[kind][value]}`}
    >
      {value}
    </span>
  );
}
