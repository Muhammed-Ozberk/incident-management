import { IncidentSeverity, IncidentStatus } from './incident.enums';

export interface AuditLog {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  summary?: string;
  serviceId: string;
  service: {
    id: string;
    name: string;
  };
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  logs?: AuditLog[];
}

export interface PaginatedIncidents {
  items: Incident[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface IncidentStats {
  total: number;
  open: number;
  critical: number;
  investigating: number;
}
