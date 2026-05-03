import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: 'blue' | 'red' | 'amber' | 'slate';
}

export function MetricCard({ icon: Icon, label, value, tone }: MetricCardProps) {
  const toneClasses = {
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-md border ${toneClasses[tone]}`}
        >
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
        {value}
      </div>
    </div>
  );
}
