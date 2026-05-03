import { AuditLog } from '../types/incident';
import { History, ArrowRight } from 'lucide-react';

interface IncidentLogsProps {
  logs: AuditLog[];
}

export function IncidentLogs({ logs }: IncidentLogsProps) {
  const filteredLogs = logs.filter((log) =>
    ['STATUS_CHANGED', 'INITIAL_CREATION', 'SOFT_DELETED'].includes(log.action),
  );

  if (filteredLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
        <History size={32} className="mb-2 opacity-20" />
        <p className="text-sm">No status activity logs found for this incident.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <History size={16} />
        Status History
      </div>
      <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-100">
        {filteredLogs.map((log) => (
          <div key={log.id} className="relative pl-8">
            <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white bg-slate-200" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {log.action.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              
              {log.action !== 'INITIAL_CREATION' && log.action !== 'SOFT_DELETED' && (
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium line-through decoration-slate-300">
                    {log.oldValue}
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                    {log.newValue}
                  </span>
                </div>
              )}
              
              {log.action === 'INITIAL_CREATION' && (
                <p className="text-sm text-slate-600">Incident was created in the system.</p>
              )}
              
              {log.action === 'SOFT_DELETED' && (
                <p className="text-sm text-rose-600 font-medium">Incident was removed.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
