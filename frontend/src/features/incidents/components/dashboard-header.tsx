import {
  Activity,
  AlertCircle,
  Bell,
  Plus,
  RefreshCw,
  ServerCrash,
} from 'lucide-react';
import { MetricCard } from './metric-card';
import type { IncidentStats } from '../types/incident';

export function DashboardHeader({
  stats,
  realtimeConnected,
  onRefresh,
  onCreate,
}: {
  stats: IncidentStats;
  realtimeConnected: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Activity size={20} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                Incident Management
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Centralized incident intake, triage, and realtime status tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                realtimeConnected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  realtimeConnected ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {realtimeConnected ? 'Realtime connected' : 'Realtime offline'}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </button>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} aria-hidden="true" />
              Create incident
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Activity} label="Total" value={stats.total} tone="slate" />
          <MetricCard icon={ServerCrash} label="Open" value={stats.open} tone="blue" />
          <MetricCard icon={AlertCircle} label="Critical" value={stats.critical} tone="red" />
          <MetricCard icon={Bell} label="Investigating" value={stats.investigating} tone="amber" />
        </div>
      </div>
    </section>
  );
}
