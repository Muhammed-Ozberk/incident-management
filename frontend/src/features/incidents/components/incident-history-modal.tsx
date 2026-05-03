import { IncidentLogs } from './incident-logs';
import { ModalShell } from './modal-shell';
import type { AuditLog } from '../types/incident';

export function IncidentHistoryModal({
  title,
  logs,
  onClose,
}: {
  title: string;
  logs: AuditLog[];
  onClose: () => void;
}) {
  return (
    <ModalShell
      ariaLabel="Incident history"
      maxWidth="max-w-[500px]"
      onClose={onClose}
    >
      <div className="mb-6 pr-8">
        <h2 className="text-lg font-bold text-slate-900">Incident History</h2>
        <p className="mt-1 truncate text-sm text-slate-500">{title}</p>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <IncidentLogs logs={logs} />
      </div>

      <div className="mt-8 flex justify-end">
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
