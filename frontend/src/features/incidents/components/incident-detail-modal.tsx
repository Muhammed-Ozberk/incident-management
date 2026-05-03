import { IncidentBadge } from './incident-badge';
import { ModalShell } from './modal-shell';
import type { Incident } from '../types/incident';

export function IncidentDetailModal({
  incident,
  onClose,
  onEdit,
}: {
  incident: Incident;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <ModalShell
      ariaLabel="Incident details"
      closeLabel="Close incident details"
      maxWidth="max-w-[620px]"
      onClose={onClose}
    >
      <div className="mb-5 pr-10">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Incident details
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          {incident.title}
        </h2>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <InfoPanel label="Service">{incident.service.name}</InfoPanel>
        <InfoPanel label="Severity">
          <IncidentBadge kind="severity" value={incident.severity} />
        </InfoPanel>
        <InfoPanel label="Status">
          <IncidentBadge kind="status" value={incident.status} />
        </InfoPanel>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Description
        </p>
        <div className="mt-3 max-h-[36vh] overflow-y-auto pr-2 text-sm leading-6 text-slate-700 custom-scrollbar">
          {incident.description}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <Timestamp label="Created" value={incident.createdAt} />
        <Timestamp label="Updated" value={incident.updatedAt} />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
}

function InfoPanel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
      <div className="mt-2 font-semibold text-slate-800">{children}</div>
    </div>
  );
}

function Timestamp({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold text-slate-700">{label}:</span>{' '}
      {new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))}
    </div>
  );
}
