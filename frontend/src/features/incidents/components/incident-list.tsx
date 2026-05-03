import { AlertTriangle, Edit2, History, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { IncidentBadge } from './incident-badge';
import { IncidentStatusActions } from './incident-status-actions';
import type { Incident, IncidentStatus } from '../types/incident';

export function IncidentList({
  incidents,
  loading,
  error,
  highlightedIds,
  onStatusChange,
  onDelete,
  onEdit,
  onViewLogs,
  onViewSummary,
  onViewDetails,
}: {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  highlightedIds: Set<string>;
  onStatusChange: (id: string, status: IncidentStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (incident: Incident) => void;
  onViewLogs: (id: string) => void;
  onViewSummary: (incident: Incident) => void;
  onViewDetails: (incident: Incident) => void;
}) {
  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          Loading incidents
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
        <div>
          <AlertTriangle className="mx-auto mb-3" size={24} aria-hidden="true" />
          <p className="font-semibold">Could not load incidents</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
        <div>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <p className="mt-3 font-semibold text-slate-900">No incidents found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting filters or create a new incident.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
      <div className="hidden grid-cols-[minmax(300px,1fr)_170px_120px_112px_132px_250px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 lg:grid">
        <div>Incident</div>
        <div>Service</div>
        <div>Severity</div>
        <div>Status</div>
        <div>Status actions</div>
        <div>Record actions</div>
      </div>

      <div className="divide-y divide-slate-100">
        {incidents.map((incident) => {
          return (
          <article
            key={incident.id}
            className="group/row relative animate-row-in"
          >
            {/* Background & Pulse Layer */}
            <div
              className={`absolute inset-0 -z-10 transition-colors duration-300 ${
                highlightedIds.has(incident.id)
                  ? 'animate-pulse-row'
                  : 'bg-white group-hover/row:bg-slate-50'
              }`}
              aria-hidden="true"
            />

            {/* Content Layer */}
            <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(300px,1fr)_170px_120px_112px_132px_250px] lg:items-center">
              <button
                type="button"
                title="View incident details"
                aria-label={`View details for ${incident.title}`}
                onClick={() => onViewDetails(incident)}
                className="min-w-0 rounded-md text-left outline-none transition focus:ring-2 focus:ring-slate-200"
              >
                <div className="line-clamp-1 text-sm font-semibold text-slate-950">
                  {incident.title}
                </div>
                <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {incident.description}
                </div>
                <span className="mt-2 block text-xs text-slate-400">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(incident.createdAt))}
                </span>
              </button>

              <div className="text-sm font-medium text-slate-700">
                {incident.service.name}
              </div>

              <div>
                <IncidentBadge kind="severity" value={incident.severity} />
              </div>

              <div>
                <IncidentBadge kind="status" value={incident.status} />
              </div>

              <div
                className="flex items-center"
              >
                <IncidentStatusActions
                  value={incident.status}
                  onChange={(status) => onStatusChange(incident.id, status)}
                />
              </div>

              <div
                className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-nowrap"
              >

                <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-50 p-1">
                  <button
                    type="button"
                    title="View history"
                    aria-label="View history"
                    onClick={() => onViewLogs(incident.id)}
                    className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <History size={15} aria-hidden="true" />
                    <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
                      View history
                    </span>
                  </button>

                  <button
                    type="button"
                    title="Edit incident"
                    aria-label="Edit incident"
                    onClick={() => onEdit(incident)}
                    className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Edit2 size={15} aria-hidden="true" />
                    <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
                      Edit incident
                    </span>
                  </button>

                  <button
                    type="button"
                    title="Delete incident"
                    aria-label="Delete incident"
                    onClick={() => onDelete(incident.id)}
                    className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
                      Delete incident
                    </span>
                  </button>
                  </div>
                  <div className="h-8 w-px shrink-0 bg-slate-200" />
                <button
                  type="button"
                  title={incident.summary ? 'View AI summary' : 'Generate AI summary'}
                  aria-label={incident.summary ? 'View AI summary' : 'Generate AI summary'}
                  onClick={() => onViewSummary(incident)}
                  className="group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-indigo-100 text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <Sparkles size={15} aria-hidden="true" />
                  <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
                    {incident.summary ? 'View AI summary' : 'Generate AI summary'}
                  </span>
                </button>                

              </div>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
