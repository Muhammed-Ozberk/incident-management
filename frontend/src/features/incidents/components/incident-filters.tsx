import type {
  IncidentQuery,
  IncidentSeverity,
  IncidentStatus,
  RegisteredService,
} from '../types/incident';

const statusOptions: Array<{ label: string; value: IncidentStatus | '' }> = [
  { label: 'All status', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'Investigating', value: 'investigating' },
  { label: 'Resolved', value: 'resolved' },
];

const severityOptions: Array<{ label: string; value: IncidentSeverity | '' }> = [
  { label: 'All severity', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

const sortOptions = [
  { label: 'Newest first', value: 'desc' },
  { label: 'Oldest first', value: 'asc' },
];

export function IncidentFilters({
  query,
  services,
  onChange,
}: {
  query: IncidentQuery;
  services: RegisteredService[];
  onChange: (patch: Partial<IncidentQuery>) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_160px]">
        <select
          value={query.serviceId ?? ''}
          onChange={(event) =>
            onChange({ serviceId: event.target.value, service: '', page: 1 })
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All services</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>

        <select
          value={query.status ?? ''}
          onChange={(event) =>
            onChange({
              status: event.target.value as IncidentStatus | '',
              page: 1,
            })
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={query.severity ?? ''}
          onChange={(event) =>
            onChange({
              severity: event.target.value as IncidentSeverity | '',
              page: 1,
            })
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          {severityOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={query.order ?? 'desc'}
          onChange={(event) =>
            onChange({
              order: event.target.value as 'asc' | 'desc',
              page: 1,
            })
          }
          className="h-10 rounded-md border border-slate-200 bg-indigo-50/30 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        >
          {sortOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
