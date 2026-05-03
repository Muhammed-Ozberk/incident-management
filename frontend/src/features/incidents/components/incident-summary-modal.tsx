import { RefreshCw, Sparkles } from 'lucide-react';
import { ModalShell } from './modal-shell';
import type { Incident } from '../types/incident';

export function IncidentSummaryModal({
  incident,
  summary,
  generated,
  loading,
  onClose,
  onRegenerate,
}: {
  incident: Incident;
  summary: string;
  generated: boolean;
  loading: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}) {
  return (
    <ModalShell ariaLabel="AI summary" maxWidth="max-w-[500px]" onClose={onClose}>
      <div className="mb-5 flex items-start gap-3 pr-8">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
          <Sparkles size={17} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Summary</h2>
          <p className="mt-1 truncate text-sm text-slate-500">
            {incident.title}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        {loading && !summary ? (
          <div className="flex min-h-24 items-center justify-center gap-2 text-sm font-medium text-slate-500">
            <RefreshCw className="animate-spin" size={16} />
            Generating summary
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-700">{summary}</p>
        )}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {generated
          ? 'This summary was generated and saved to the incident.'
          : 'Showing the saved summary from the incident.'}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Close
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <RefreshCw className={loading ? 'animate-spin' : undefined} size={15} />
          Regenerate summary
        </button>
      </div>
    </ModalShell>
  );
}
