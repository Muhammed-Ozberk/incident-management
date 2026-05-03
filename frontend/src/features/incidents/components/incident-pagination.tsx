import type { IncidentQuery, PaginationMeta } from '../types/incident';

export function IncidentPagination({
  meta,
  limit,
  onChange,
}: {
  meta: PaginationMeta;
  limit: number;
  onChange: (patch: Partial<IncidentQuery>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing page {meta?.page || 1} of {meta?.totalPages || 1},{' '}
        {meta?.total || 0} total incidents
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Per page</span>
          <select
            value={limit}
            onChange={(event) =>
              onChange({ limit: Number(event.target.value), page: 1 })
            }
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onChange({ page: meta.page - 1 })}
          className="h-9 rounded-md border border-slate-200 px-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange({ page: meta.page + 1 })}
          className="h-9 rounded-md border border-slate-200 px-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
