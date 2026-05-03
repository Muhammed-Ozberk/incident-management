import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Plus, RefreshCw, Send, Sparkles } from 'lucide-react';
import { incidentsApi } from '../api/incidents-api';
import type {
  CreateIncidentPayload,
  IncidentSeverity,
  RegisteredService,
} from '../types/incident';

const severities: IncidentSeverity[] = ['low', 'medium', 'high', 'critical'];

function createInitialForm(serviceId = ''): CreateIncidentPayload {
  return {
    title: '',
    description: '',
    serviceId,
    severity: 'medium',
  };
}

export function IncidentForm({
  onSubmit,
  services,
  initialData,
}: {
  onSubmit: (payload: CreateIncidentPayload) => Promise<void>;
  services: RegisteredService[];
  initialData?: CreateIncidentPayload;
}) {
  const [form, setForm] = useState<CreateIncidentPayload>(() =>
    initialData ?? createInitialForm(services[0]?.id ?? ''),
  );
  const [submitting, setSubmitting] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing || services.length === 0 || form.serviceId) {
      return;
    }

    setForm((current) => ({
      ...current,
      serviceId: services[0].id,
    }));
  }, [form.serviceId, services, isEditing]);

  async function handleAiSuggest() {
    if (!form.title || !form.description) {
      setError('Please provide a title and description for AI analysis.');
      return;
    }

    setLoadingAi(true);
      setError(null);
    try {
      const response = await incidentsApi.getAiSuggestions(form.title, form.description);
      const { severity, serviceId, reasoning } = response.data;

      setForm((current) => ({
        ...current,
        severity,
        serviceId: services.some((service) => service.id === serviceId)
          ? serviceId
          : current.serviceId,
      }));
      setAiReasoning(reasoning);
    } catch {
      setError('AI suggestion failed. Please fill manually.');
    } finally {
      setLoadingAi(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.serviceId) {
      setError('Please select a registered service.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(form);
      if (!isEditing) {
        setForm(createInitialForm(services[0]?.id ?? ''));
        setAiReasoning(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} incident`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
    >
      <div className="flex items-center gap-3 pr-10">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{isEditing ? 'Edit incident' : 'Create incident'}</h2>
          <p className="text-sm text-slate-500">{isEditing ? 'Update the incident details.' : 'Add a tracked service event.'}</p>
        </div>
        <button
          type="button"
          onClick={handleAiSuggest}
          disabled={loadingAi || submitting || services.length === 0}
          title="Suggest with AI"
          className="ml-auto flex h-9 items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 text-xs font-bold uppercase tracking-wider text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
        >
          {loadingAi ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          AI Suggest
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            required
            maxLength={160}
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            required
            rows={4}
            maxLength={5000}
            className="min-h-28 w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Field label="Service">
            <select
              value={form.serviceId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  serviceId: event.target.value,
                }))
              }
              disabled={services.length === 0}
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
            >
              {services.length === 0 ? (
                <option value="">No services available</option>
              ) : (
                services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))
              )}
            </select>
          </Field>

          <Field label="Severity">
            <select
              value={form.severity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  severity: event.target.value as IncidentSeverity,
                }))
              }
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm capitalize outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {aiReasoning && (
          <div className="rounded-md border border-indigo-100 bg-indigo-50/50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
              <Sparkles size={12} />
              AI Suggestion
            </div>
            <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-indigo-500">
              Reasoning
            </div>
            <p className="mt-2 text-xs leading-relaxed text-indigo-800">
              {aiReasoning}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || services.length === 0}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={16} aria-hidden="true" />
        {submitting ? (isEditing ? 'Updating' : 'Creating') : (isEditing ? 'Update' : 'Create')}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
