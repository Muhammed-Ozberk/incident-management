import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  RegisteredService,
} from '../../incidents/types/incident';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const servicesApi = {
  async list() {
    return request<RegisteredService[]>('/services');
  },

  async create(payload: { name: string; description?: string }) {
    return request<RegisteredService>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
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
