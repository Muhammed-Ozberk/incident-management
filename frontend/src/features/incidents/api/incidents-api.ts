import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateIncidentPayload,
  Incident,
  IncidentAiSummary,
  IncidentAiSuggestion,
  IncidentListData,
  IncidentQuery,
  IncidentStats,
  UpdateIncidentPayload,
} from '../types/incident';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const incidentsApi = {
  async list(query: IncidentQuery, signal?: AbortSignal) {
    const searchParams = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
    });

    if (query.status) searchParams.set('status', query.status);
    if (query.severity) searchParams.set('severity', query.severity);
    if (query.serviceId) searchParams.set('serviceId', query.serviceId);
    if (query.service?.trim()) searchParams.set('service', query.service.trim());
    if (query.order) searchParams.set('order', query.order);

    return request<IncidentListData>(`/incidents?${searchParams.toString()}`, {
      signal,
    });
  },

  async getStats() {
    return request<IncidentStats>('/incidents/stats');
  },

  async getById(id: string) {
    return request<Incident>(`/incidents/${id}`);
  },

  async create(payload: CreateIncidentPayload) {
    return request<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateIncidentPayload) {
    return request<Incident>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string) {
    return request<{ id: string }>(`/incidents/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getAiSuggestions(title: string, description: string) {
    return request<IncidentAiSuggestion>('/incidents/ai-suggest', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  async getAiSummary(id: string, regenerate = false) {
    return request<IncidentAiSummary>(`/incidents/${id}/ai-summary`, {
      method: 'POST',
      body: JSON.stringify({ regenerate }),
    });
  },
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const payload = (await response.json()) as
    | ApiSuccessResponse<T>
    | ApiErrorResponse;

  if (!response.ok || payload.status === false) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}
