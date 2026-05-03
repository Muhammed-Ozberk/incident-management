import { CheckCircle2, CircleDot, SearchCheck } from 'lucide-react';
import type { IncidentStatus } from '../types/incident';

const statuses: Array<{
  value: IncidentStatus;
  label: string;
  icon: typeof CircleDot;
  className: string;
}> = [
  {
    value: 'open',
    label: 'Set open',
    icon: CircleDot,
    className: 'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
  },
  {
    value: 'investigating',
    label: 'Set investigating',
    icon: SearchCheck,
    className:
      'hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700',
  },
  {
    value: 'resolved',
    label: 'Set resolved',
    icon: CheckCircle2,
    className:
      'hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700',
  },
];

export function IncidentStatusActions({
  value,
  onChange,
}: {
  value: IncidentStatus;
  onChange: (status: IncidentStatus) => void;
}) {
  return (
    <div className="flex shrink-0 flex-nowrap gap-1.5">
      {statuses.map((status) => {
        const Icon = status.icon;
        const selected = status.value === value;

        return (
          <button
            key={status.value}
            type="button"
            onClick={() => onChange(status.value)}
            disabled={selected}
            title={status.label}
            aria-label={status.label}
            className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
              selected
                ? 'cursor-default border-slate-300 bg-slate-100 text-slate-700'
                : `border-slate-200 bg-white text-slate-500 ${status.className}`
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-medium normal-case text-white shadow-lg group-hover:block">
              {status.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
