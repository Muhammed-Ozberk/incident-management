export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLog {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  summary?: string;
  serviceId: string;
  service: ServiceSummary;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  logs?: AuditLog[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IncidentListData {
  items: Incident[];
  meta: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  status: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: false;
  message: string;
}

export interface IncidentQuery {
  page: number;
  limit: number;
  status?: IncidentStatus | '';
  severity?: IncidentSeverity | '';
  service?: string;
  serviceId?: string;
  order?: 'asc' | 'desc';
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  serviceId: string;
  severity: IncidentSeverity;
}

export interface UpdateIncidentPayload {
  title?: string;
  description?: string;
  summary?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  serviceId?: string;
}

export interface IncidentAiSuggestion {
  severity: IncidentSeverity;
  serviceId: string;
  serviceName: string;
  reasoning: string;
}

export interface IncidentAiSummary {
  summary: string;
  generated: boolean;
}

export interface ServiceSummary {
  id: string;
  name: string;
}

export interface RegisteredService extends ServiceSummary {
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentStats {
  total: number;
  open: number;
  critical: number;
  investigating: number;
}
